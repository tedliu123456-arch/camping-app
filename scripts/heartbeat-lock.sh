#!/bin/bash
# Camping App heartbeat 巡檢鎖
# 用途：避免兩個 heartbeat 同時執行造成版本號互相覆寫（index.html 與 version.json 不一致）
# 用法：
#   ./scripts/heartbeat-lock.sh acquire   # 取得鎖（成功 exit 0，失敗 exit 1）
#   ./scripts/heartbeat-lock.sh release   # 釋放鎖
set -u
LOCK_DIR="$(dirname "$0")/../.git/heartbeat.lock"
STALE_SECONDS=900

acquire() {
  if mkdir "$LOCK_DIR" 2>/dev/null; then
    date +%s > "$LOCK_DIR/pid"
    echo "LOCK_ACQUIRED"
    return 0
  fi
  # 檢查是否為過期鎖
  if [ -f "$LOCK_DIR/pid" ]; then
    now=$(date +%s); then_ts=$(cat "$LOCK_DIR/pid" 2>/dev/null || echo 0)
    if [ $((now - then_ts)) -gt "$STALE_SECONDS" ]; then
      rm -rf "$LOCK_DIR"
      mkdir "$LOCK_DIR" && date +%s > "$LOCK_DIR/pid"
      echo "LOCK_ACQUIRED_STALE"
      return 0
    fi
  fi
  echo "LOCK_BUSY"
  return 1
}

release() {
  rm -rf "$LOCK_DIR"
  echo "LOCK_RELEASED"
}

case "${1:-}" in
  acquire) acquire ;;
  release) release ;;
  status)  [ -d "$LOCK_DIR" ] && echo "LOCKED" || echo "FREE" ;;
  *) echo "usage: $0 {acquire|release|status}"; exit 2 ;;
esac
