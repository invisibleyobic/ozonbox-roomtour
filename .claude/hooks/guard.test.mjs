// Тесты защитного hook-а. Запуск: node --test .claude/hooks/guard.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { check } from './guard.mjs';

const GUARD = fileURLToPath(new URL('./guard.mjs', import.meta.url));
const bash = (command) => check({ tool_name: 'Bash', tool_input: { command } });
const ps = (command) => check({ tool_name: 'PowerShell', tool_input: { command } });
const tool = (tool_name, tool_input) => check({ tool_name, tool_input });
const id = (verdict) => verdict && verdict.id;

test('секреты в командах', () => {
  for (const cmd of ['cat .env', 'type .env.local', 'grep DATABASE_URL .env', 'source .env',
    'cp .env /tmp/x', 'echo $(cat ./app/.env.production)', 'node -r dotenv/config x.js < .env']) {
    assert.equal(id(bash(cmd)), 'env-file', cmd);
  }
  assert.equal(id(ps('Get-Content .env')), 'env-file');
  for (const cmd of ['cat .env.example', 'git add .env.example', 'grep -c "^DATABASE_URL=" .env',
    'test -f .env && echo есть', 'ls -la .env', 'git check-ignore -v .env', 'npm run dev',
    'grep -q TOKEN .env || echo нет']) {
    assert.equal(bash(cmd), null, cmd);
  }
  assert.equal(ps('Test-Path .env'), null);
});

test('git только поимённо и без обхода проверок', () => {
  for (const cmd of ['git add .', 'git add -A', 'git add --all', 'git add -u', 'git add *',
    'git -C repo add .', 'git commit -am "fix"', 'git add ./']) {
    assert.equal(id(bash(cmd)), 'git-add-all', cmd);
  }
  for (const cmd of ['git commit --no-verify -m x', 'git commit -n -m x', 'git -c core.hooksPath=/dev/null commit -m x']) {
    assert.equal(id(bash(cmd)), 'git-skip-checks', cmd);
  }
  assert.equal(id(bash('git push --force origin master')), 'git-force-push');
  assert.equal(id(bash('git push -f')), 'git-force-push');
  for (const cmd of ['git add CLAUDE.md architecture/README.md', 'git commit -m "idea: pitch"',
    'git commit --amend -m x', 'git push origin master', 'git status', 'git diff --cached',
    'git add .gitignore', 'git add .claude/settings.json']) {
    assert.equal(bash(cmd), null, cmd);
  }
});

test('база: без сброса и массового удаления', () => {
  for (const cmd of ['npx prisma migrate reset', 'npx prisma migrate reset --force',
    'npx prisma db push --force-reset', 'npx prisma db push --accept-data-loss', 'dropdb shop',
    'psql -c "DROP TABLE orders"', 'psql -c "truncate orders"', 'psql -c "DELETE FROM orders"']) {
    assert.equal(id(bash(cmd)), 'db-reset', cmd);
  }
  for (const cmd of ['npx prisma generate', 'npx prisma validate', 'npx prisma format',
    'psql -c "DELETE FROM sessions WHERE expires_at < now()"', 'npx prisma migrate status']) {
    assert.equal(bash(cmd), null, cmd);
  }
});

test('обход разрешений и защищённые папки', () => {
  assert.equal(id(bash('claude --dangerously-skip-permissions')), 'bypass-permissions');
  for (const cmd of ['rm -rf idea', 'rm -r ./architecture/', 'rm .business/INDEX.md', 'rm -rf .git',
    'cd x && rm -rf architecture']) {
    assert.equal(id(bash(cmd)), 'protected-dirs', cmd);
  }
  assert.equal(id(ps('Remove-Item -Recurse idea')), 'protected-dirs');
  for (const cmd of ['rm -rf node_modules', 'rm -rf .next', 'rm mockups/tmp.html', 'ls idea', 'cat architecture/README.md',
    'rm -rf node_modules/.cache/idea']) {
    assert.equal(bash(cmd), null, cmd);
  }
});

test('инструменты файлов', () => {
  assert.equal(id(tool('Read', { file_path: 'X:\\proj\\.env' })), 'secret-file');
  assert.equal(id(tool('Read', { file_path: '/p/.env.production' })), 'secret-file');
  assert.equal(id(tool('Edit', { file_path: '/p/certs/server.key', old_string: 'a', new_string: 'b' })), 'secret-file');
  assert.equal(id(tool('Grep', { pattern: 'TOKEN', path: '.env' })), 'secret-file');
  assert.equal(id(tool('Grep', { pattern: 'TOKEN', glob: '.env*' })), 'secret-file');
  assert.equal(tool('Read', { file_path: '/p/.env.example' }), null);
  assert.equal(tool('Edit', { file_path: '/p/.env.example', old_string: 'A=', new_string: 'A=\nB=' }), null);
  assert.equal(tool('Grep', { pattern: 'TOKEN', glob: '.env.example' }), null);
  assert.equal(tool('Read', { file_path: '/p/architecture/README.md' }), null);
  assert.equal(id(tool('Write', { file_path: '/p/.claude/settings.json', content: '{"permissions":{"defaultMode":"bypassPermissions"}}' })), 'bypass-permissions');
  assert.equal(id(tool('Edit', { file_path: 'C:\\u\\.claude\\settings.local.json', old_string: 'x', new_string: '"defaultMode": "bypassPermissions"' })), 'bypass-permissions');
  assert.equal(tool('Write', { file_path: '/p/.claude/settings.json', content: '{"permissions":{"deny":[]}}' }), null);
  assert.equal(tool('Glob', { pattern: '**/.env' }), null);
});

test('процесс: код 2 и причина в stderr, код 0 для разрешённого', () => {
  const run = (payload) => spawnSync(process.execPath, [GUARD], { input: JSON.stringify(payload), encoding: 'utf8' });
  const blocked = run({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: 'git add .' } });
  assert.equal(blocked.status, 2);
  assert.match(blocked.stderr, /ozonbox-guard.*git-add-all/);
  const allowed = run({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: 'git status' } });
  assert.equal(allowed.status, 0);
  assert.equal(allowed.stderr, '');
  const broken = spawnSync(process.execPath, [GUARD], { input: 'не json', encoding: 'utf8' });
  assert.equal(broken.status, 1);
});
