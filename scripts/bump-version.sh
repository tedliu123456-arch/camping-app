#!/bin/bash
# 統一升版腳本：一次同步 index.html / platform-app.html / version.json，避免版本號不一致
# 用法：./scripts/bump-version.sh "說明1" "說明2" ...
set -eu
cd "$(dirname "$0")/.."

LOCK_DIR=".git/heartbeat.lock"
STALE_SECONDS=900
acquire() {
  if mkdir "$LOCK_DIR" 2>/dev/null; then date +%s > "$LOCK_DIR/pid"; return 0; fi
  if [ -f "$LOCK_DIR/pid" ]; then
    now=$(date +%s); then_ts=$(cat "$LOCK_DIR/pid" 2>/dev/null || echo 0)
    if [ $((now - then_ts)) -gt "$STALE_SECONDS" ]; then
      rm -rf "$LOCK_DIR"; mkdir "$LOCK_DIR"; date +%s > "$LOCK_DIR/pid"; return 0
    fi
  fi
  echo "LOCK_BUSY（另一巡檢進行中，略過本輪）" >&2
  exit 1
}
release() { rm -rf "$LOCK_DIR"; }
trap release EXIT
acquire

NEXT=$(node -e "
const fs=require('fs');
const v=JSON.parse(fs.readFileSync('version.json','utf8'));
let max=0;
for(const c of (v.changelog||[])){ const n=parseFloat(c.version); if(!isNaN(n)&&n>max) max=n; }
const cur=parseFloat(v.version); if(!isNaN(cur)&&cur>max) max=cur;
console.log((Math.round((max+0.01)*100)/100).toFixed(2));
")
DATE=$(date +%Y-%m-%d)

sed -i '' -E "s/Camping App v[0-9.]+/Camping App v${NEXT}/g; s/APP_VERSION = '[0-9.]*'/APP_VERSION = '${NEXT}'/g" index.html platform-app.html

node -e "
const fs=require('fs');
const nv=process.argv[1], date=process.argv[2];
const notes=process.argv.slice(3);
const v=JSON.parse(fs.readFileSync('version.json','utf8'));
v.version=nv; v.lastUpdated=date;
const seen=new Set(); const out=[];
for(const c of (v.changelog||[])){ if(seen.has(c.version)) continue; seen.add(c.version); out.push(c); }
v.changelog=out;
v.changelog.unshift({version:nv,date,changes:[...notes,'介面版本更新為 v'+nv]});
fs.writeFileSync('version.json',JSON.stringify(v,null,2));
" "$NEXT" "$DATE" "$@"

echo "VERSION_BUMPED -> v${NEXT}"
grep -o "APP_VERSION = '[0-9.]*'" index.html platform-app.html
