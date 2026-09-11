#!/usr/bin/env bash
# Аудит безопасности OzoneBox: тесты защит + проверка всего индекса Git.
#
# Основа - claude-code-starter 1.1.0. Прежняя версия этого файла проверяла сам
# шаблон стартера перед публикацией (данные автора стартера) и к проекту не
# относилась; она сохранена в истории Git.
#
# Что проверяется:
#   1. тесты сканера секретов (scripts/tests);
#   2. тесты защитного hook-а Claude Code (.claude/hooks);
#   3. .business/ не отслеживается Git;
#   4. все файлы индекса Git - сканером scripts/check_secrets.py.
# Эвристика: не проверяет историю Git, зависимости и персональные данные в тексте.
# Локально сначала добавь в индекс только намеченные файлы (поимённо).
# Код выхода: 0 - находок нет, 1 - есть находки, 2 - проверка не завершена.
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"

PY=""
for candidate in python3 python "py -3"; do
  if $candidate -c 'import sys; sys.exit(0 if sys.version_info >= (3, 8) else 1)' >/dev/null 2>&1; then
    PY=$candidate
    break
  fi
done
if [ -z "$PY" ]; then
  echo "Нет Python 3.8+ - аудит не выполнен." >&2
  exit 2
fi

echo "== 1. Тесты сканера секретов"
$PY -m unittest discover -s scripts/tests -p 'test_*.py'

echo "== 2. Тесты защитного hook-а Claude Code"
if command -v node >/dev/null 2>&1; then
  node --test .claude/hooks/guard.test.mjs
else
  echo "Нет Node.js - тесты hook-а не выполнены." >&2
  exit 2
fi

echo "== 3. .business/ не в индексе Git"
if [ -n "$(git ls-files -- .business)" ]; then
  echo "FAIL: .business/ отслеживается Git - убери из индекса: git rm -r --cached -- .business" >&2
  exit 1
fi
echo "OK"

echo "== 4. Все файлы индекса Git"
# shellcheck disable=SC2086
exec $PY scripts/check_secrets.py --tracked
