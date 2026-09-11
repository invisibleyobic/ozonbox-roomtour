"""Offline synthetic Git-index regression tests; no credentials/network.

Based on claude-code-starter 1.1.0 tests/test_security.py. OzoneBox additions:
stack patterns (PatternTests), private paths, the real .env.example, and
Windows-safe skips (no newline file names, symlinks may need admin rights).
Run: python -m unittest discover -s scripts/tests -p 'test_*.py'
"""
import importlib.util
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

SCRIPTS = Path(__file__).resolve().parents[1]
ROOT = SCRIPTS.parent
SCANNER = SCRIPTS / 'check_secrets.py'
HOOK = ROOT / '.github/hooks/pre-commit.sample'
FAKE = 'SYNTHETIC_' + 'NOT_A_CREDENTIAL'

spec = importlib.util.spec_from_file_location('check_secrets', SCANNER)
check_secrets = importlib.util.module_from_spec(spec)
spec.loader.exec_module(check_secrets)


class PatternTests(unittest.TestCase):
    """Content and path rules for the OzoneBox stack, without Git."""

    def findings(self, text):
        return check_secrets.content_findings(text.encode('utf-8'))

    def test_stack_credentials_found(self):
        jwt = '.'.join(['eyJ' + 'a' * 20, 'eyJ' + 'b' * 20, 'c' * 24])
        # Pairs, not a dict: "password': '..." in this source would itself look like an assignment.
        cases = [
            ('database-url-password', 'DATABASE_URL=postgresql://shop:' + 'Synth3tic' + '@db.internal:5432/shop'),
            ('jwt', 'const wb = "' + jwt + '"'),
            ('provider-credential', 'key = "' + 'YCAJ' + 'x' * 22 + '"'),
            ('credential-assignment', 'CLOUDPAYMENTS_API_SECRET=' + 'a1b2c3d4' * 4),
        ]
        for name, text in cases:
            with self.subTest(name=name):
                self.assertIn(name, self.findings(text))
        telegram = '1234567890:' + 'A' * 35
        self.assertIn('provider-credential', self.findings('bot("' + telegram + '")'))

    def test_typescript_code_is_not_a_credential(self):
        for text in [
            'const secret = process.env.' + 'CLOUDPAYMENTS_API_SECRET!;',
            'apiSecret: import.meta.env.' + 'VITE_PUBLIC_KEY_NAME,',
            'const token = createToken(order.id, 3600);',
            'secret: ' + 'config.payments.apiSecret,',
            'password: z.string().min(12),',
            'url = env("DATABASE_URL")',
            'DATABASE_URL=postgresql://<USER>:<PASSWORD>@localhost:5432/shop',
        ]:
            with self.subTest(text=text):
                self.assertEqual(self.findings(text), [])

    def test_project_env_example_is_clean(self):
        example = ROOT / '.env.example'
        self.assertTrue(example.exists())
        self.assertEqual(check_secrets.content_findings(example.read_bytes()), [])
        self.assertFalse(check_secrets.forbidden_path(b'.env.example'))

    def test_private_paths(self):
        for path in [b'.business/INDEX.md', b'exports/orders.csv', b'uploads/a.jpg',
                     b'backup/shop.dump', b'db/shop.sql.gz', b'.env.production']:
            with self.subTest(path=path):
                self.assertTrue(check_secrets.forbidden_path(path))
        for path in [b'examples/coffeeshop/.business/INDEX.md', b'prisma/migrations/1/migration.sql',
                     b'src/lib/storage.ts', b'architecture/schema.prisma']:
            with self.subTest(path=path):
                self.assertFalse(check_secrets.forbidden_path(path))


class SecurityTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.git('init', '-q')

    def git(self, *args):
        return subprocess.run(['git', *args], cwd=self.root, check=True,
                              stdout=subprocess.PIPE, stderr=subprocess.PIPE).stdout

    def commit(self):
        self.git('-c', 'user.name=Test', '-c', 'user.email=test@example.invalid',
                 'commit', '--no-verify', '-qm', 'synthetic fixture')

    def stage(self, name, content):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding='utf-8')
        self.git('add', '-f', '--', name)
        return path

    def scan(self, mode='--staged'):
        return subprocess.run([sys.executable, str(SCANNER), mode], cwd=self.root,
                              capture_output=True, text=True)

    def test_index_secrets_redacted_with_unusual_names(self):
        marker = 'SYNTHETIC_' + 'AUDIT_ONLY_NOT_A_CREDENTIAL'
        names = ['normal.txt', 'space name.txt', '-dash.txt', 'кириллица.txt']
        if os.name != 'nt':
            names.append('line\nbreak.txt')
        for name in names:
            with self.subTest(name=name):
                path = self.stage(name, 'token = "' + marker + '"\n')
                path.unlink()  # Index-only content must still be checked.
                result = self.scan()
                self.assertEqual(result.returncode, 1, result.stderr)
                self.assertNotIn(marker, result.stdout + result.stderr)
                self.assertNotIn('token =', result.stdout + result.stderr)
                self.git('rm', '--cached', '--', name)

    def test_clean_index_passes(self):
        self.stage('safe.txt', 'hello\n')
        result = self.scan()
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_env_paths_and_examples(self):
        for name in ['.env', '.env.production', 'nested dir/.env.staging',
                     '.env.example.local', '.claude/settings.local.json', '.mcp.json',
                     'nested/credentials.json', '.business/INDEX.md']:
            with self.subTest(name=name):
                self.stage(name, 'safe text\n')
                self.assertEqual(self.scan().returncode, 1)
                self.git('rm', '--cached', '--', name)
        for name in ['.env.example', 'nested dir/.env.sample']:
            self.stage(name, 'API_KEY=<YOUR_API_KEY>\nTOKEN=${YOUR_TOKEN}\nPASSWORD=\n')
        self.assertEqual(self.scan().returncode, 0)
        self.stage('.env.example', 'API_KEY=' + FAKE + '\n')
        self.assertEqual(self.scan().returncode, 1)

    def test_staged_deletion_does_not_read_worktree(self):
        self.stage('.env', 'not a credential')
        self.commit()
        self.git('rm', '--cached', '--', '.env')
        self.assertTrue((self.root / '.env').exists())
        self.assertEqual(self.scan().returncode, 0)
        self.assertEqual(self.scan('--tracked').returncode, 0)

    def test_unstaged_changes_cannot_hide_staged_secret(self):
        path = self.stage('code.txt', 'password=' + FAKE)
        path.write_text('safe')
        self.assertEqual(self.scan().returncode, 1)
        self.git('add', 'code.txt')
        path.write_text('password=' + FAKE)
        self.assertEqual(self.scan().returncode, 0)

    def test_tracked_mode_includes_unchanged_scripts_hooks_and_tests(self):
        for name in ['scripts/deploy.py', '.github/hooks/custom', 'tests/other.py',
                     'scripts/check_secrets.py', 'tests/test_security.py']:
            self.stage(name, 'secret=' + FAKE)
        self.commit()
        self.assertEqual(self.scan().returncode, 0)
        result = self.scan('--tracked')
        self.assertEqual(result.returncode, 1)
        self.assertEqual(result.stdout.count('BLOCKED'), 5)

    def test_provider_private_and_binary_patterns(self):
        values = ['sk-' + 'x' * 32, 'sk_live_' + 'x' * 24,
                  'ghp_' + 'x' * 36, 'AKIA' + 'X' * 16,
                  '-----BEGIN ' + 'PRIVATE KEY-----']
        for value in values:
            self.stage('binary.dat', '\0' + value)
            result = self.scan()
            self.assertEqual(result.returncode, 1)
            self.assertNotIn(value, result.stdout + result.stderr)

    def test_git_failure_is_closed_without_stderr_leak(self):
        shutil.rmtree(self.root / '.git')
        result = self.scan()
        self.assertEqual(result.returncode, 2)
        self.assertIn('scan incomplete', result.stderr)

    def test_missing_blob_is_closed(self):
        self.stage('file.txt', 'hello')
        oid = self.git('rev-parse', ':file.txt').decode().strip()
        obj = self.root / '.git/objects' / oid[:2] / oid[2:]
        os.chmod(obj, 0o644)  # Git marks objects read-only; Windows refuses unlink otherwise.
        obj.unlink()
        self.assertEqual(self.scan().returncode, 2)

    def test_scanner_and_test_sources_need_no_exclusions(self):
        for source in [SCANNER, Path(__file__).resolve(), HOOK]:
            self.stage(source.name, source.read_text(encoding='utf-8'))
        result = self.scan('--tracked')
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_hook_resolves_root_from_subdirectory(self):
        bash = shutil.which('bash')
        if not bash or 'system32' in bash.lower():
            self.skipTest('Git Bash not found (WSL bash is not a substitute)')
        (self.root / 'scripts').mkdir()
        shutil.copy2(SCANNER, self.root / 'scripts/check_secrets.py')
        self.stage('space name.txt', 'token=' + FAKE)
        (self.root / 'space name.txt').unlink()
        result = subprocess.run([bash, str(HOOK)], cwd=self.root / 'scripts',
                                capture_output=True, text=True)
        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)

    def test_symlink_blob_not_external_target(self):
        try:
            os.symlink('/nonexistent/external/file', self.root / 'link')
        except OSError:
            self.skipTest('symlinks need extra rights on this system')
        self.git('add', 'link')
        self.assertEqual(self.scan().returncode, 0)

    def test_staged_rename_is_scanned(self):
        self.stage('old.txt', 'token=' + FAKE)
        self.commit()
        self.git('mv', 'old.txt', 'new name.txt')
        self.assertEqual(self.scan().returncode, 1)

    def test_unmerged_index_fails_closed(self):
        self.stage('conflict.txt', 'safe')
        oid = self.git('rev-parse', ':conflict.txt').decode().strip()
        self.git('update-index', '--force-remove', 'conflict.txt')
        data = f'100644 {oid} 1\tconflict.txt\0'.encode()
        subprocess.run(['git', 'update-index', '-z', '--index-info'], cwd=self.root,
                       input=data, check=True, capture_output=True)
        self.assertEqual(self.scan().returncode, 2)
        self.assertEqual(self.scan('--tracked').returncode, 2)

    def test_submodule_fails_closed_instead_of_claiming_coverage(self):
        self.stage('file.txt', 'safe')
        self.commit()
        oid = self.git('rev-parse', 'HEAD').decode().strip()
        self.git('update-index', '--add', '--cacheinfo', f'160000,{oid},vendor')
        self.assertEqual(self.scan().returncode, 2)


if __name__ == '__main__':
    unittest.main()
