#!/usr/bin/env bash
#
# check_stack.sh — Verify a local Retail-Agentic-Commerce deployment.
#
# Detects whether the stack is running via Docker Compose (nginx-fronted)
# or via local development (`install.sh`, services on host ports) and
# runs the health checks documented in deploy/docker-deployment.md and
# deploy/local-development.md, printing a single pass/fail summary.
#
# Usage:
#   ./scripts/check_stack.sh
#
# Exit code is non-zero if any required check fails.

set -uo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

pass() { printf "  ${GREEN}PASS${NC}  %s\n" "$1"; PASS=$((PASS+1)); }
fail() { printf "  ${RED}FAIL${NC}  %s\n" "$1"; FAIL=$((FAIL+1)); }
warn() { printf "  ${YELLOW}WARN${NC}  %s\n" "$1"; WARN=$((WARN+1)); }
section() { printf "\n\033[1m%s\033[0m\n" "$1"; }

http_ok() {
  # http_ok <url> — returns 0 if the URL responds with a 2xx/3xx status
  local url="$1"
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 4 "$url" 2>/dev/null)
  [[ "$code" =~ ^(2|3)[0-9]{2}$ ]]
}

# ---------------------------------------------------------------------------
section "1. Prerequisites"
# ---------------------------------------------------------------------------

for bin in docker curl; do
  if command -v "$bin" >/dev/null 2>&1; then
    pass "$bin is installed"
  else
    fail "$bin is not installed or not on PATH"
  fi
done

if docker compose version >/dev/null 2>&1; then
  pass "Docker Compose v2 is available"
else
  fail "Docker Compose v2 not found (try: docker compose version)"
fi

for bin in uv node pnpm; do
  if command -v "$bin" >/dev/null 2>&1; then
    pass "$bin is installed"
  else
    warn "$bin not found on PATH (only required for local-dev mode)"
  fi
done

# ---------------------------------------------------------------------------
section "2. Environment configuration"
# ---------------------------------------------------------------------------

if [[ -f .env ]]; then
  pass ".env file found"
  if grep -qE '^NVIDIA_API_KEY=nvapi-.+' .env; then
    pass "NVIDIA_API_KEY looks set in .env"
  else
    fail "NVIDIA_API_KEY missing or still a placeholder in .env"
  fi
else
  fail ".env file not found (copy env.example to .env and set NVIDIA_API_KEY)"
fi

if docker network inspect acp-infra-network >/dev/null 2>&1; then
  pass "Docker network 'acp-infra-network' exists"
else
  warn "Docker network 'acp-infra-network' not found (create with: docker network create acp-infra-network)"
fi

# ---------------------------------------------------------------------------
section "3. Detecting deployment mode"
# ---------------------------------------------------------------------------

MODE="unknown"
if docker compose -f docker-compose.infra.yml -f docker-compose.yml ps --status running 2>/dev/null | grep -q .; then
  MODE="docker"
  pass "Docker Compose stack has running containers -> checking in DOCKER mode"
elif http_ok "http://localhost:8000/docs"; then
  MODE="local"
  pass "Merchant API reachable on host port 8000 -> checking in LOCAL DEV mode"
else
  fail "Could not detect a running stack (neither Docker containers nor host-port services responded)"
  echo -e "\nNo services detected. Start the stack first:"
  echo "  Docker:    docker compose -f docker-compose.infra.yml -f docker-compose.yml up --build -d"
  echo "  Local dev: ./install.sh"
  exit 1
fi

# ---------------------------------------------------------------------------
section "4. Core service health"
# ---------------------------------------------------------------------------

if [[ "$MODE" == "docker" ]]; then
  http_ok "http://localhost/api/health"       && pass "Merchant API  (http://localhost/api/health)"       || fail "Merchant API  (http://localhost/api/health)"
  http_ok "http://localhost/psp/health"       && pass "PSP service  (http://localhost/psp/health)"        || fail "PSP service  (http://localhost/psp/health)"
  http_ok "http://localhost/apps-sdk/health"  && pass "Apps SDK MCP (http://localhost/apps-sdk/health)"   || fail "Apps SDK MCP (http://localhost/apps-sdk/health)"
  http_ok "http://localhost/"                 && pass "Demo UI      (http://localhost/)"                 || fail "Demo UI      (http://localhost/)"
else
  http_ok "http://localhost:8000/docs"  && pass "Merchant API  (http://localhost:8000/docs)"  || fail "Merchant API  (http://localhost:8000/docs)"
  http_ok "http://localhost:8001/docs"  && pass "PSP service  (http://localhost:8001/docs)"   || fail "PSP service  (http://localhost:8001/docs)"
  http_ok "http://localhost:2091/docs"  && pass "Apps SDK MCP (http://localhost:2091/docs)"   || fail "Apps SDK MCP (http://localhost:2091/docs)"
  http_ok "http://localhost:3000/"      && pass "Demo UI      (http://localhost:3000/)"       || fail "Demo UI      (http://localhost:3000/)"
fi

# ---------------------------------------------------------------------------
section "5. NAT agent health"
# ---------------------------------------------------------------------------

if [[ "$MODE" == "docker" ]]; then
  # Agents are internal-only in full Docker deployment; check from inside
  # the merchant container, as documented in deploy/docker-deployment.md.
  AGENT_OUT=$(docker compose -f docker-compose.infra.yml -f docker-compose.yml exec -T merchant \
    python -c "
import urllib.request as u
for name, host in [('promotion','promotion-agent:8002'),('post-purchase','post-purchase-agent:8003'),('recommendation','recommendation-agent:8004'),('search','search-agent:8005')]:
    try:
        code = u.urlopen(f'http://{host}/health', timeout=5).status
        print(f'{name}:{code}')
    except Exception as e:
        print(f'{name}:ERROR:{e}')
" 2>/dev/null)

  for agent in promotion post-purchase recommendation search; do
    line=$(echo "$AGENT_OUT" | grep "^${agent}:")
    if echo "$line" | grep -q ':200$'; then
      pass "${agent} agent (internal, via merchant container)"
    else
      fail "${agent} agent (internal, via merchant container) -> ${line:-no response}"
    fi
  done
else
  http_ok "http://localhost:8002/health" && pass "promotion agent      (http://localhost:8002/health)" || fail "promotion agent      (http://localhost:8002/health)"
  http_ok "http://localhost:8003/health" && pass "post-purchase agent  (http://localhost:8003/health)" || fail "post-purchase agent  (http://localhost:8003/health)"
  http_ok "http://localhost:8004/health" && pass "recommendation agent (http://localhost:8004/health)" || fail "recommendation agent (http://localhost:8004/health)"
  http_ok "http://localhost:8005/health" && pass "search agent         (http://localhost:8005/health)" || fail "search agent         (http://localhost:8005/health)"
fi

# ---------------------------------------------------------------------------
section "6. Infrastructure (best-effort)"
# ---------------------------------------------------------------------------

http_ok "http://localhost:6006" && pass "Phoenix traces (http://localhost:6006)" || warn "Phoenix traces (http://localhost:6006) not reachable"
http_ok "http://localhost:9001" && pass "MinIO console  (http://localhost:9001)" || warn "MinIO console  (http://localhost:9001) not reachable"

# ---------------------------------------------------------------------------
section "Summary"
# ---------------------------------------------------------------------------

echo -e "  ${GREEN}${PASS} passed${NC}, ${RED}${FAIL} failed${NC}, ${YELLOW}${WARN} warnings${NC} (mode: ${MODE})\n"

if [[ "$FAIL" -gt 0 ]]; then
  echo "See deploy/TROUBLESHOOTING.md for fixes to common failures."
  exit 1
fi

exit 0
