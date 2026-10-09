#!/usr/bin/env python3
"""Read-only public GitHub release completion gate; Python standard library only."""
import argparse
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import re
import sys
from urllib.parse import quote, urlparse
from urllib.request import Request, urlopen
from zipfile import ZipFile

LIMIT = 24 * 1024 * 1024


class VerificationError(Exception):
    pass


def require(condition, message):
    if not condition:
        raise VerificationError(message)


def public_get(url):
    parsed = urlparse(url)
    require(parsed.scheme == 'https' and parsed.hostname in
            {'api.github.com', 'github.com', 'codeload.github.com'}, 'Unexpected download host')
    request = Request(url, headers={'User-Agent': 'quota-aware-agents-release-verifier',
                                   'Accept': 'application/vnd.github+json'})
    with urlopen(request, timeout=20) as response:
        final = urlparse(response.url)
        require(final.scheme == 'https' and final.hostname in
                {'api.github.com', 'github.com', 'codeload.github.com'}, 'Unexpected redirect host')
        data = response.read(LIMIT + 1)
    require(len(data) <= LIMIT, 'Response exceeds size limit')
    return data


def local_files(root):
    require(root.is_dir(), 'Candidate repository is unavailable')
    files = {}
    for path in sorted(root.rglob('*')):
        name = path.relative_to(root).as_posix()
        if '.git' in path.relative_to(root).parts:
            continue
        require(not path.is_symlink(), 'Candidate contains a symlink: ' + name)
        if path.is_file():
            files[name] = path.read_bytes()
    return files


def package_version(files):
    manifest = json.loads(files['checksums.json'])
    version = manifest['version']
    require(bool(re.fullmatch(r'\d+\.\d+\.\d+', version)), 'Invalid version')
    entries = manifest['files']
    names = [entry['path'] for entry in entries]
    require(len(names) == len(set(names)), 'Duplicate manifest entries')
    prefix = 'quota-aware-agents/'
    actual = {name[len(prefix):] for name in files if name.startswith(prefix)}
    require(actual == set(names), 'Skill manifest does not cover the exact installed file set')
    for entry in entries:
        name = entry['path']
        require(not PurePosixPath(name).is_absolute() and '..' not in PurePosixPath(name).parts,
                'Unsafe manifest path')
        digest = hashlib.sha256(files[prefix + name]).hexdigest().upper()
        require(digest == entry['sha256'].upper(), 'Skill checksum mismatch: ' + name)
    entry = files[prefix + 'SKILL.md'].decode('utf-8')
    front = entry.split('---', 2)[1]
    match = re.search(r"^\s+version:\s*['\"]?([^'\"\s]+)", front, re.M)
    require(match is not None and match.group(1) == version, 'Skill and manifest version mismatch')
    labels = {'README.md': '当前版本：', 'README.en.md': 'Current version: ',
              '安装说明.md': '版本：', 'INSTALL.en.md': 'Skill version:** '}
    for name, label in labels.items():
        heading = '\n'.join(files[name].decode('utf-8').splitlines()[:12])
        require(re.search(re.escape(label + version) + r'(?![0-9.])', heading) is not None,
                'Document version mismatch: ' + name)
    return version, len(names)


def archive_files(data):
    files = {}
    roots = set()
    with ZipFile(io.BytesIO(data)) as archive:
        require(sum(info.file_size for info in archive.infolist()) <= LIMIT,
                'Expanded archive exceeds size limit')
        for info in archive.infolist():
            path = PurePosixPath(info.filename)
            require(not path.is_absolute() and '..' not in path.parts and
                    '\\' not in info.filename, 'Unsafe archive path')
            require(bool(path.parts), 'Empty archive path')
            roots.add(path.parts[0])
            if info.is_dir():
                continue
            require(len(path.parts) > 1, 'Archive lacks repository prefix')
            name = PurePosixPath(*path.parts[1:]).as_posix()
            require(name not in files, 'Duplicate archive path: ' + name)
            files[name] = archive.read(info)
    require(len(roots) == 1, 'Archive has multiple repository roots')
    return files


def verify(root, expected, repository, get=public_get):
    require(bool(re.fullmatch(r'[0-9a-f]{40}', expected)), 'Expected commit must be a full SHA')
    require(bool(re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+', repository)), 'Invalid repository')
    files = local_files(root)
    version, installed_count = package_version(files)
    api = 'https://api.github.com/repos/' + repository

    def read(path):
        return json.loads(get(api + path))

    head = read('/git/ref/heads/main')['object']
    require(head['type'] == 'commit' and head['sha'] == expected, 'main differs from frozen expected commit')
    release = read('/releases/latest')
    tag = 'v' + version
    require(release['tag_name'] == tag, 'Latest Release is ' + release['tag_name'] + '; expected ' + tag)
    require(not release['draft'] and not release['prerelease'] and bool(release['published_at']),
            'Latest Release is not public and stable')
    tag_ref = read('/git/ref/tags/' + quote(tag, safe=''))['object']
    obj = tag_ref
    seen = set()
    while obj['type'] == 'tag':
        require(obj['sha'] not in seen and len(seen) < 8, 'Invalid annotated tag chain')
        seen.add(obj['sha'])
        obj = read('/git/tags/' + obj['sha'])['object']
    require(obj['type'] == 'commit' and obj['sha'] == expected, 'Release tag targets a different commit')
    downloaded = get(release['zipball_url'])
    archived = archive_files(downloaded)
    require(set(archived) == set(files), 'Release ZIP repository file set differs from frozen candidate')
    for name, data in files.items():
        require(archived[name] == data, 'Release ZIP bytes differ: ' + name)
    archive_version, archive_count = package_version(archived)
    require((archive_version, archive_count) == (version, installed_count), 'Release ZIP package mismatch')
    # Catch a concurrent branch move during verification rather than certifying a stale head.
    final_head = read('/git/ref/heads/main')['object']
    require(final_head == head, 'main changed during verification')
    final_release = read('/releases/latest')
    require(final_release['id'] == release['id'] and final_release['tag_name'] == tag and
            not final_release['draft'] and not final_release['prerelease'], 'Latest Release changed during verification')
    final_tag = read('/git/ref/tags/' + quote(tag, safe=''))['object']
    require(final_tag == tag_ref, 'Tag changed during verification')
    return {'status': 'passed', 'version': version, 'commit': expected,
            'release': release['html_url'], 'repository_files': len(files),
            'installed_files': installed_count, 'zip_sha256': hashlib.sha256(downloaded).hexdigest()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--expected-commit', required=True)
    parser.add_argument('--repository', default='mario110333/quota-aware-agents')
    parser.add_argument('--repo-root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--output', type=Path, help='Write a new record outside the candidate repository')
    args = parser.parse_args()
    if args.output:
        require(not args.output.exists(), 'Output record already exists')
        require(not args.output.resolve().is_relative_to(args.repo_root.resolve()),
                'Output must be outside the frozen candidate')
    try:
        result = verify(args.repo_root, args.expected_commit, args.repository)
        code = 0
    except Exception as error:
        result = {'status': 'failed', 'error': str(error)}
        code = 1
    body = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        with args.output.open('x', encoding='utf-8', newline='\n') as stream:
            stream.write(body)
    print(body, end='')
    return code


if __name__ == '__main__':
    sys.exit(main())
