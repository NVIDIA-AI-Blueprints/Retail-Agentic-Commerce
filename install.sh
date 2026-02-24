#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# install.sh — Local development setup for Retail Agentic Commerce
#
# Installs dependencies, starts all 8 services in background, verifies health.
# Usage: ./install.sh
# Stop:  ./stop.sh
# =============================================================================

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$ROOT_DIR/.local-dev.pids"
LOG_DIR="$ROOT_DIR/logs"
ENV_FILE="$ROOT_DIR/.env"
ROOT_VENV="$ROOT_DIR/.venv"
AGENTS_DIR="$ROOT_DIR/src/agents"
AGENTS_VENV="$AGENTS_DIR/.venv"
UI_DIR="$ROOT_DIR/src/ui"
WIDGET_DIR="$ROOT_DIR/src/apps_sdk/web"

# --- Colors ----------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

info()  { printf "${CYAN}[INFO]${NC}  %s\n" "$1"; }
ok()    { printf "${GREEN}[OK]${NC}    %s\n" "$1"; }
warn()  { printf "${YELLOW}[WARN]${NC}  %s\n" "$1"; }
err()   { printf "${RED}[ERROR]${NC} %s\n" "$1"; }

# =============================================================================
# 1. Idempotency — stop existing services if running
# =============================================================================
if [ -f "$PID_FILE" ]; then
    warn "Existing services detected (.local-dev.pids found). Stopping them first..."
    if [ -x "$ROOT_DIR/stop.sh" ]; then
        "$ROOT_DIR/stop.sh"
    else
        # Inline fallback if stop.sh isn't executable yet
        while IFS=: read -r pid name; do
            kill "$pid" 2>/dev/null || true
        done < "$PID_FILE"
        sleep 2
        while IFS=: read -r pid name; do
            kill -9 "$pid" 2>/dev/null || true
        done < "$PID_FILE"
        rm -f "$PID_FILE"
    fi
fi

# =============================================================================
# 2. Validate prerequisites
# =============================================================================
info "Checking prerequisites..."
PREREQ_FAIL=0

check_cmd() {
    if ! command -v "$1" &>/dev/null; then
        err "$1 is not installed. $2"
        PREREQ_FAIL=1
    fi
}

check_cmd "python3" "Install Python 3.12+: https://www.python.org/downloads/"
check_cmd "uv"      "Install uv: curl -LsSf https://astral.sh/uv/install.sh | sh"
check_cmd "node"    "Install Node.js 18+: https://nodejs.org/"
check_cmd "pnpm"    "Install pnpm: npm install -g pnpm"

# Check Python version (need 3.12+)
if command -v python3 &>/dev/null; then
    PY_VER=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
    PY_MAJOR=$(echo "$PY_VER" | cut -d. -f1)
    PY_MINOR=$(echo "$PY_VER" | cut -d. -f2)
    if [ "$PY_MAJOR" -lt 3 ] || { [ "$PY_MAJOR" -eq 3 ] && [ "$PY_MINOR" -lt 12 ]; }; then
        err "Python 3.12+ required, found $PY_VER"
        PREREQ_FAIL=1
    else
        ok "Python $PY_VER"
    fi
fi

# Check Node version (need 18+)
if command -v node &>/dev/null; then
    NODE_VER=$(node -v | sed 's/^v//')
    NODE_MAJOR=$(echo "$NODE_VER" | cut -d. -f1)
    if [ "$NODE_MAJOR" -lt 18 ]; then
        err "Node.js 18+ required, found $NODE_VER"
        PREREQ_FAIL=1
    else
        ok "Node.js $NODE_VER"
    fi
fi

if [ "$PREREQ_FAIL" -ne 0 ]; then
    err "Prerequisites not met. Install the missing tools above and re-run."
    exit 1
fi
ok "All prerequisites met"

# =============================================================================
# 3. Environment setup
# =============================================================================
info "Configuring environment..."

if [ ! -f "$ENV_FILE" ]; then
    cp "$ROOT_DIR/env.example" "$ENV_FILE"
    ok "Created .env from env.example"
else
    ok ".env already exists"
fi

# Source env vars we need
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

# Validate NVIDIA_API_KEY
if [ -z "${NVIDIA_API_KEY:-}" ] || [ "$NVIDIA_API_KEY" = "nvapi-xxx" ]; then
    err "NVIDIA_API_KEY is not configured."
    echo ""
    echo "  Get a free API key at: https://build.nvidia.com/settings/api-keys"
    echo "  Then set it in your .env file:  NVIDIA_API_KEY=nvapi-..."
    echo ""
    exit 1
fi
ok "NVIDIA_API_KEY is set"

# Warn on non-default NIM endpoints
if [ "${NIM_LLM_BASE_URL:-}" != "https://integrate.api.nvidia.com/v1" ] || \
   [ "${NIM_EMBED_BASE_URL:-}" != "https://integrate.api.nvidia.com/v1" ]; then
    warn "NIM endpoints are not using public defaults — using custom endpoints"
fi

# =============================================================================
# 4. Install dependencies
# =============================================================================
info "Installing dependencies..."

# Root venv
info "Setting up root Python environment..."
cd "$ROOT_DIR"
uv venv --quiet 2>/dev/null || uv venv
uv sync --quiet 2>/dev/null || uv sync
ok "Root venv ready ($ROOT_VENV)"

# Agents venv
info "Setting up agents Python environment..."
cd "$AGENTS_DIR"
uv venv --quiet 2>/dev/null || uv venv
"$AGENTS_VENV/bin/pip" install -q -e ".[dev]" 2>/dev/null || uv pip install -e ".[dev]" --python "$AGENTS_VENV/bin/python"
ok "Agents venv ready ($AGENTS_VENV)"

# UI
info "Installing UI dependencies..."
cd "$UI_DIR"
if [ ! -f ".env.local" ]; then
    cp env.example .env.local
    ok "Created src/ui/.env.local from env.example"
fi
pnpm install --frozen-lockfile 2>/dev/null || pnpm install
ok "UI dependencies installed"

# Apps SDK Widget (non-blocking)
info "Installing Apps SDK widget dependencies..."
cd "$WIDGET_DIR"
if pnpm install --frozen-lockfile 2>/dev/null || pnpm install 2>/dev/null; then
    ok "Apps SDK widget dependencies installed"
else
    warn "Apps SDK widget install failed (non-blocking, widget dev server may not work)"
fi

cd "$ROOT_DIR"

# =============================================================================
# 5. Start services
# =============================================================================
info "Starting services..."
mkdir -p "$LOG_DIR"

# Parallel arrays for Bash 3.2 compatibility (no declare -A)
SVC_NAMES=()
SVC_PORTS=()
SVC_PIDS=()

start_service() {
    local name="$1" port="$2" logfile="$LOG_DIR/$1.log"
    shift 2

    # Run the command in background, redirect output to log
    "$@" > "$logfile" 2>&1 &
    local pid=$!
    echo "$pid:$name" >> "$PID_FILE"
    SVC_NAMES+=("$name")
    SVC_PORTS+=("$port")
    SVC_PIDS+=("$pid")
    info "  Started $name (PID $pid, port $port) → logs/$name.log"
}

# --- Backend services (using root venv uvicorn) ---
start_service "merchant" 8000 \
    "$ROOT_VENV/bin/uvicorn" src.merchant.main:app --host 0.0.0.0 --port 8000

start_service "psp" 8001 \
    "$ROOT_VENV/bin/uvicorn" src.payment.main:app --host 0.0.0.0 --port 8001

start_service "apps-sdk" 2091 \
    "$ROOT_VENV/bin/uvicorn" src.apps_sdk.main:app --host 0.0.0.0 --port 2091

# --- NAT Agents (using agents venv, need env vars) ---
# Env vars are already exported from the source above (set -a / set +a block)
NAT_ENV_VARS=(
    NVIDIA_API_KEY
    NIM_LLM_BASE_URL
    NIM_LLM_MODEL_NAME
    NIM_EMBED_BASE_URL
    NIM_EMBED_MODEL_NAME
    MILVUS_URI
    PHOENIX_ENDPOINT
)

# Build env prefix for agent commands
AGENT_ENV=""
for var in "${NAT_ENV_VARS[@]}"; do
    val="${!var:-}"
    if [ -n "$val" ]; then
        AGENT_ENV="$AGENT_ENV $var=$val"
    fi
done

start_agent() {
    local name="$1"
    local port="$2"
    local config="$3"
    local logfile="$LOG_DIR/$name.log"
    cd "$AGENTS_DIR"
    env $AGENT_ENV "$AGENTS_VENV/bin/nat" serve --config_file "configs/$config" --port "$port" > "$logfile" 2>&1 &
    local pid=$!
    echo "$pid:$name" >> "$PID_FILE"
    SVC_NAMES+=("$name")
    SVC_PORTS+=("$port")
    SVC_PIDS+=("$pid")
    info "  Started $name (PID $pid, port $port) → logs/$name.log"
    cd "$ROOT_DIR"
}

start_agent "promotion-agent"      8002 "promotion.yml"
start_agent "post-purchase-agent"  8003 "post-purchase.yml"
start_agent "recommendation-agent" 8004 "recommendation.yml"
start_agent "search-agent"         8005 "search.yml"

# --- UI (Next.js dev server) ---
cd "$UI_DIR"
pnpm dev > "$LOG_DIR/ui.log" 2>&1 &
UI_PID=$!
echo "$UI_PID:ui" >> "$PID_FILE"
SVC_NAMES+=("ui")
SVC_PORTS+=("3000")
SVC_PIDS+=("$UI_PID")
info "  Started ui (PID $UI_PID, port 3000) → logs/ui.log"
cd "$ROOT_DIR"

ok "All services launched"

# =============================================================================
# 6. Health checks
# =============================================================================
info "Waiting for services to start (10s)..."
sleep 10

printf "\n${BOLD}%-25s %-6s %-8s %s${NC}\n" "SERVICE" "PORT" "STATUS" "PID"
printf "%-25s %-6s %-8s %s\n"  "-------" "----" "------" "---"

HEALTH_ENDPOINTS_NAMES=( "merchant" "psp" "apps-sdk" "promotion-agent" "post-purchase-agent" "recommendation-agent" "search-agent" "ui" )
HEALTH_ENDPOINTS_PORTS=( 8000       8001  2091       8002              8003                  8004                   8005           3000 )
HEALTH_ENDPOINTS_PATHS=( "/health"  "/health" "/health" "/health"      "/health"             "/health"              "/health"      "/" )

ALL_HEALTHY=true

for i in "${!HEALTH_ENDPOINTS_NAMES[@]}"; do
    name="${HEALTH_ENDPOINTS_NAMES[$i]}"
    port="${HEALTH_ENDPOINTS_PORTS[$i]}"
    path="${HEALTH_ENDPOINTS_PATHS[$i]}"

    # Find the PID for this service
    pid="?"
    for j in "${!SVC_NAMES[@]}"; do
        if [ "${SVC_NAMES[$j]}" = "$name" ]; then
            pid="${SVC_PIDS[$j]}"
            break
        fi
    done

    # Check health with retries
    status="${RED}FAIL${NC}"
    for attempt in 1 2 3; do
        if curl -sf "http://localhost:$port$path" -o /dev/null --max-time 3 2>/dev/null; then
            status="${GREEN}OK${NC}"
            break
        fi
        sleep 2
    done

    if [[ "$status" == *"FAIL"* ]]; then
        ALL_HEALTHY=false
    fi

    printf "%-25s %-6s %-8b %s\n" "$name" "$port" "$status" "$pid"
done

# =============================================================================
# 7. Summary
# =============================================================================
printf "\n"
if $ALL_HEALTHY; then
    printf "${GREEN}${BOLD}All services are running!${NC}\n"
else
    printf "${YELLOW}${BOLD}Some services failed health checks. Check logs for details.${NC}\n"
fi

printf "\n${BOLD}Access URLs:${NC}\n"
echo "  Demo UI:         http://localhost:3000"
echo "  Merchant API:    http://localhost:8000/docs"
echo "  PSP:             http://localhost:8001/docs"
echo "  Apps SDK MCP:    http://localhost:2091/docs"
echo "  Phoenix Traces:  http://localhost:6006  (requires Docker infra)"
echo "  MinIO Console:   http://localhost:9001  (requires Docker infra)"
printf "\n${BOLD}Logs:${NC}            $LOG_DIR/<service>.log\n"
printf "${BOLD}Stop services:${NC}   ./stop.sh\n\n"
