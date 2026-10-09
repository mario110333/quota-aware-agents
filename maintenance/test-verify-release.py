"""Isolated failure-path tests. No network, credentials, or fixture directories."""
import io
import json
from pathlib import Path
import runpy
import unittest
from unittest.mock import patch
from zipfile import ZipFile

SOURCE = Path(__file__).parent / 'verify-release.py'
MODULE = runpy.run_path(str(SOURCE))
VERIFY = MODULE['verify']
GLOBALS = VERIFY.__globals__
BASE = MODULE['local_files'](SOURCE.parent.parent)
SHA = 'a' * 40
OTHER = 'b' * 40
REPO = 'mario110333/quota-aware-agents'
API = 'https://api.github.com/repos/' + REPO
VERSION = json.loads(BASE['checksums.json'])['version']
ZIP_URL = API + '/zipball/v' + VERSION


def zipped(files):
    stream = io.BytesIO()
    with ZipFile(stream, 'w') as archive:
        for name, body in files.items():
            archive.writestr('repo-prefix/' + name, body)
    return stream.getvalue()


class ReleaseVerificationTests(unittest.TestCase):
    def run_check(self, *, local=None, archive=None, stale=False, wrong_tag=False,
                  wrong_main=False, draft=False, annotated=False, move=None):
        counts = {}
        release = {'id': 1, 'tag_name': 'v1.2.0' if stale else 'v' + VERSION,
                   'draft': draft, 'prerelease': False, 'published_at': '2026-10-09T00:00:00Z',
                   'zipball_url': ZIP_URL, 'html_url': 'https://github.com/' + REPO + '/releases/tag/v' + VERSION}

        def get(url):
            counts[url] = counts.get(url, 0) + 1
            if url == ZIP_URL:
                return zipped(BASE if archive is None else archive)
            if url.endswith('/git/ref/heads/main'):
                sha = OTHER if wrong_main or (move == 'main' and counts[url] > 1) else SHA
                return json.dumps({'object': {'type': 'commit', 'sha': sha}}).encode()
            if url.endswith('/releases/latest'):
                value = dict(release)
                if move == 'release' and counts[url] > 1:
                    value['id'] = 2
                return json.dumps(value).encode()
            if url.endswith('/git/ref/tags/v' + VERSION):
                sha = OTHER if wrong_tag or (move == 'tag' and counts[url] > 1) else SHA
                return json.dumps({'object': {'type': 'tag' if annotated else 'commit', 'sha': sha}}).encode()
            if url == API + '/git/tags/' + SHA and annotated:
                return json.dumps({'object': {'type': 'commit', 'sha': SHA}}).encode()
            raise AssertionError('Unexpected URL: ' + url)

        with patch.dict(GLOBALS, {'local_files': lambda root: BASE if local is None else local}):
            return VERIFY(Path('unused'), SHA, REPO, get)

    def test_matching_public_archive_passes(self):
        self.assertEqual(self.run_check()['status'], 'passed')

    def test_annotated_tag_resolves_to_expected_commit(self):
        self.assertEqual(self.run_check(annotated=True)['commit'], SHA)

    def test_old_latest_release_fails(self):
        with self.assertRaisesRegex(MODULE['VerificationError'], 'Latest Release is v1.2.0'):
            self.run_check(stale=True)

    def test_wrong_tag_commit_fails(self):
        with self.assertRaisesRegex(MODULE['VerificationError'], 'tag targets'):
            self.run_check(wrong_tag=True)

    def test_wrong_main_commit_fails(self):
        with self.assertRaisesRegex(MODULE['VerificationError'], 'main differs'):
            self.run_check(wrong_main=True)

    def test_nonpublic_release_fails(self):
        with self.assertRaisesRegex(MODULE['VerificationError'], 'not public and stable'):
            self.run_check(draft=True)

    def test_tampered_archive_fails(self):
        changed = dict(BASE)
        changed['quota-aware-agents/SKILL.md'] += b'changed'
        with self.assertRaisesRegex(MODULE['VerificationError'], 'ZIP bytes differ'):
            self.run_check(archive=changed)

    def test_missing_and_extra_archive_files_fail(self):
        for kind in ['missing', 'extra']:
            with self.subTest(kind=kind):
                changed = dict(BASE)
                if kind == 'missing':
                    del changed['quota-aware-agents/LICENSE']
                else:
                    changed['unapproved-file.txt'] = b'extra'
                with self.assertRaisesRegex(MODULE['VerificationError'], 'file set differs'):
                    self.run_check(archive=changed)

    def test_incomplete_local_manifest_fails(self):
        changed = dict(BASE)
        del changed['quota-aware-agents/LICENSE']
        with self.assertRaisesRegex(MODULE['VerificationError'], 'exact installed file set'):
            self.run_check(local=changed)

    def test_document_version_prefix_is_not_exact_match(self):
        changed = dict(BASE)
        changed['README.md'] = changed['README.md'].replace(('当前版本：' + VERSION).encode(),
                                                         ('当前版本：' + VERSION + '0').encode())
        with self.assertRaisesRegex(MODULE['VerificationError'], 'Document version mismatch'):
            self.run_check(local=changed)

    def test_concurrent_remote_changes_fail(self):
        for event in ['main', 'release', 'tag']:
            with self.subTest(event=event):
                with self.assertRaisesRegex(MODULE['VerificationError'], 'changed during verification'):
                    self.run_check(move=event)


if __name__ == '__main__':
    unittest.main()
