#!/usr/bin/env node
// Защитный hook Claude Code для OzoneBox (событие PreToolUse, см. .claude/settings.json).
//
// Claude Code передаёт на stdin JSON вызова инструмента. Код выхода 2 и текст в stderr
// отменяют вызов, Claude видит причину. Код 0 - вызов идёт дальше, к обычным разрешениям.
// Правила - из CLAUDE.md и architecture/00-правила-проекта.md:
//   - секреты (.env, ключи) не читаем и не правим, кроме шаблонов .env.example / .env.sample;
//   - в git только поимённо: без `git add .`, `-A`, `commit -a`, без обхода pre-commit;
//   - базу не сбрасываем и данные не удаляем без решения владельца;
//   - idea/, architecture/, .business/ и .git не удаляем;
//   - режим обхода разрешений (bypassPermissions) не включаем.
// Это страховка от ошибок агента, а не граница безопасности: её можно обойти,
// например, скриптом на другом языке. Тесты: node --test .claude/hooks/guard.test.mjs

import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ENV_TEMPLATES = new Set(['.env.example', '.env.sample']);
const ENV_MENTION = /(?:^|[\s'"=<>|;&(,])((?:[\w.~:\\/-]*[\\/])?\.env(?:\.[\w.-]+)?)(?=$|[\s'"|;&)>,])/g;
// Проверка наличия без вывода значений: grep -c/-q/-l, test -f, ls, Test-Path, git check-ignore.
const PRESENCE_ONLY = /^\s*(?:grep\s+(?:-[A-Za-z]*[cqlL][A-Za-z]*\s+)|test\s+-[efs]\s|\[\s+-[efs]\s|ls(?:\s|$)|Test-Path\s|git\s+(?:check-ignore|ls-files)\s)/;
const PROTECTED_DIRS = /(?:^|[\s'"=])(?:\.[\\/])?(?:[A-Za-z]:[\\/][^\s'"]*?[\\/])?(idea|architecture|\.business|\.git)(?=$|[\s'"\\/;&|])/i;

export function isSecretFile(filePath) {
  if (!filePath) return false;
  const name = basename(String(filePath).replace(/\\/g, '/')).toLowerCase();
  if (ENV_TEMPLATES.has(name)) return false;
  return /^\.env(\..+)?$/.test(name) || /\.(pem|key)$/.test(name) || name === 'credentials.json';
}

function segments(command) {
  return command.split(/&&|\|\||[;|\n]/);
}

const COMMAND_RULES = [
  {
    id: 'env-file',
    reason: 'команда обращается к файлу с секретами (.env). Значения не читаем и не выводим. ' +
      'Проверить, что переменная задана, можно без вывода значения: grep -c "^ИМЯ=" .env. ' +
      'Шаблон .env.example можно читать и править.',
    test: (cmd) => segments(cmd).some((part) => {
      const names = [...part.matchAll(ENV_MENTION)].map((m) => basename(m[1].replace(/\\/g, '/')));
      const secret = names.some((n) => !ENV_TEMPLATES.has(n.toLowerCase()));
      return secret && !PRESENCE_ONLY.test(part);
    }),
  },
  {
    id: 'git-add-all',
    reason: 'правило проекта: в git добавляем файлы поимённо. Без `git add .`, `-A`, `--all`, `-u` и `commit -a`.',
    test: (cmd) => /\bgit\s+(?:-C\s+\S+\s+)?add\b[^;&|\n]*?(?:\s)(?:\.|\.\/|-A|--all|-u|--update|\*|:\/)(?=$|[\s;&|])/.test(cmd) ||
      /\bgit\s+(?:-C\s+\S+\s+)?commit\b[^;&|\n]*?\s-[A-Za-z]*a[A-Za-z]*(?=$|\s)/.test(cmd),
  },
  {
    id: 'git-skip-checks',
    reason: 'обход проверки секретов (pre-commit) запрещён: без --no-verify и без подмены core.hooksPath.',
    test: (cmd) => /\bgit\b[^;&|\n]*\s--no-verify\b/.test(cmd) ||
      /\bgit\s+(?:-C\s+\S+\s+)?commit\b[^;&|\n]*\s-[A-Za-z]*n[A-Za-z]*(?=$|\s)/.test(cmd) ||
      /\bgit\b[^;&|\n]*-c\s+core\.hooksPath/i.test(cmd),
  },
  {
    id: 'git-force-push',
    reason: 'принудительный push переписывает историю. Только по отдельному решению владельца.',
    test: (cmd) => /\bgit\s+(?:-C\s+\S+\s+)?push\b[^;&|\n]*\s(?:--force(?:-with-lease)?|-f)(?=$|[\s=])/.test(cmd),
  },
  {
    id: 'db-reset',
    reason: 'сброс базы или удаление данных. Правило 00: удалять и пересчитывать заказы и промокоды - только с разрешения владельца, базу не меняем.',
    test: (cmd) => /\bprisma\s+migrate\s+reset\b/i.test(cmd) ||
      /\bprisma\s+db\s+push\b[^;&|\n]*--(?:force-reset|accept-data-loss)/i.test(cmd) ||
      /\bdropdb\b/i.test(cmd) ||
      /\b(?:DROP\s+(?:DATABASE|SCHEMA|TABLE)|TRUNCATE)\b/i.test(cmd) ||
      /\bDELETE\s+FROM\b(?![^;]*\bWHERE\b)/i.test(cmd),
  },
  {
    id: 'bypass-permissions',
    reason: 'режим обхода разрешений не включаем (решение владельца от 11.09.2026).',
    test: (cmd) => /--dangerously-skip-permissions|bypassPermissions/i.test(cmd),
  },
  {
    id: 'protected-dirs',
    reason: 'idea/, architecture/, .business/ и .git хранят замысел, чертёж и историю проекта. Удаление - только руками владельца.',
    test: (cmd) => segments(cmd).some((part) =>
      /^\s*(?:sudo\s+)?(?:rm|rmdir|del|erase|rd|Remove-Item|ri)\b/i.test(part) && PROTECTED_DIRS.test(part.replace(/^\s*\S+/, ' '))),
  },
];

function fileTargets(input) {
  const t = input.tool_input || {};
  return [t.file_path, t.notebook_path, t.path].filter(Boolean);
}

function newText(input) {
  const t = input.tool_input || {};
  const parts = [t.content, t.new_string, t.new_source];
  for (const e of t.edits || []) parts.push(e.new_string);
  return parts.filter((p) => typeof p === 'string').join('\n');
}

// Возвращает null (пропустить) или { id, reason } (остановить).
export function check(input) {
  const tool = input && input.tool_name;
  const t = (input && input.tool_input) || {};
  if (tool === 'Bash' || tool === 'PowerShell') {
    const cmd = String(t.command || '');
    const rule = COMMAND_RULES.find((r) => r.test(cmd));
    return rule ? { id: rule.id, reason: rule.reason } : null;
  }
  if (['Read', 'Edit', 'Write', 'MultiEdit', 'NotebookEdit', 'Grep'].includes(tool)) {
    const globs = tool === 'Grep' && t.glob ? [t.glob] : [];
    if (fileTargets(input).some(isSecretFile) || globs.some((g) => /(^|[\\/])\.env(?!\.(example|sample)$)/.test(g))) {
      return { id: 'secret-file', reason: 'файл с секретами (.env, ключи). Читать и править можно только .env.example.' };
    }
    const target = fileTargets(input).join(' ');
    if (/settings(\.local)?\.json$/i.test(target) && /bypassPermissions/.test(newText(input))) {
      return { id: 'bypass-permissions', reason: 'режим обхода разрешений не включаем (решение владельца от 11.09.2026).' };
    }
  }
  return null;
}

function main() {
  let input;
  try {
    input = JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    process.stderr.write('[ozonbox-guard] не удалось разобрать вход hook-а - проверка пропущена\n');
    process.exit(1);
  }
  const verdict = check(input);
  if (verdict) {
    process.stderr.write(`[ozonbox-guard] Остановлено (${verdict.id}): ${verdict.reason}\n`);
    process.exit(2);
  }
  process.exit(0);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) main();
