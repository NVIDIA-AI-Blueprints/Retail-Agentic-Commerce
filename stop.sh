#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# stop.sh — Stop all local development services
#
# Reads .local-dev.pids, sends SIGTERM, waits for graceful shutdown,
# then SIGKILL any remaining processes. Removes PID file when done.
# =============================================================================

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$ROOT_DIR/.local-dev.pids"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info() { printf "${CYAN}[INFO]${NC}  %s\n" "$1"; }
ok()   { printf "${GREEN}[OK]${NC}    %s\n" "$1"; }
warn() { printf "${YELLOW}[WARN]${NC}  %s\n" "$1"; }

if [ ! -f "$PID_FILE" ]; then
    warn "No .local-dev.pids file found. Nothing to stop."
    exit 0
fi

info "Stopping services..."

# Send SIGTERM to all
while IFS=: read -r pid name; do
    if kill -0 "$pid" 2>/dev/null; then
        kill "$pid" 2>/dev/null || true
        info "  Sent SIGTERM to $name (PID $pid)"
    else
        warn "  $name (PID $pid) already stopped"
    fi
done < "$PID_FILE"

# Wait up to 5 seconds for graceful shutdown
info "Waiting up to 5s for graceful shutdown..."
for i in 1 2 3 4 5; do
    ALL_DEAD=true
    while IFS=: read -r pid name; do
        if kill -0 "$pid" 2>/dev/null; then
            ALL_DEAD=false
            break
        fi
    done < "$PID_FILE"
    if $ALL_DEAD; then
        break
    fi
    sleep 1
done

# SIGKILL any remaining
while IFS=: read -r pid name; do
    if kill -0 "$pid" 2>/dev/null; then
        kill -9 "$pid" 2>/dev/null || true
        warn "  Sent SIGKILL to $name (PID $pid)"
    fi
done < "$PID_FILE"

rm -f "$PID_FILE"
ok "All services stopped. PID file removed."
