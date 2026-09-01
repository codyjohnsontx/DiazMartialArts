import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * An npm below 11.11.0 strips the `libc` array from every platform-specific
 * optional dependency on install, prints an `EBADENGINE` warning and exits 0.
 * That is what commit a55222b (2026-08-03) did, and it survived a week of
 * green CI. `libc` marks which C library a prebuilt binary targets, which is
 * how npm tells a glibc artifact from a musl one.
 *
 * CI's lockfile-drift step cannot see this. npm reuses locked metadata, so a
 * lockfile that arrives already stripped is a fixed point: `npm install`
 * writes nothing and `git diff --exit-code` returns 0. Drift catches a good
 * lockfile being CHANGED; this catches a damaged one being INTRODUCED. Neither
 * subsumes the other, which is why both exist.
 */

const LOCKFILE = path.join(process.cwd(), 'package-lock.json');

// These four publish no `libc` upstream rather than having lost it: they were
// equally bare at 6a982e4, the last commit before the damage.
const LIBC_ABSENT_UPSTREAM = new Set([
  'node_modules/@rolldown/binding-linux-arm-gnueabihf',
  'node_modules/@unrs/resolver-binding-linux-arm-gnueabihf',
  'node_modules/@unrs/resolver-binding-linux-arm-musleabihf',
  'node_modules/lightningcss-linux-arm-gnueabihf',
]);

// The other half of the a55222b damage: a stray flag on one nested entry.
const FSEVENTS = 'node_modules/@playwright/test/node_modules/fsevents';

type LockfileEntry = {
  os?: string[];
  libc?: string[];
  dev?: boolean;
};

const packages: Record<string, LockfileEntry> = JSON.parse(readFileSync(LOCKFILE, 'utf8')).packages;

describe('package-lock.json platform metadata', () => {
  it('keeps `libc` on every linux binary that upstream publishes it for', () => {
    const stripped = Object.entries(packages)
      .filter(([name, entry]) => entry.os?.includes('linux') && !LIBC_ABSENT_UPSTREAM.has(name))
      .filter(([, entry]) => !entry.libc?.length)
      .map(([name]) => name);

    expect(
      stripped,
      [
        `${stripped.length} linux package(s) lost their \`libc\` array, which is how npm tells a`,
        'glibc artifact from a musl one. An npm below 11.11.0 strips it on install and exits 0.',
        'Restore the arrays from the last known-good lockfile (`git show 6a982e4:package-lock.json`),',
        'or run `corepack enable npm` and regenerate with the pinned npm >= 11.11.0.',
        `Missing: ${stripped.join(', ')}`,
      ].join(' '),
    ).toEqual([]);
  });

  it('leaves the nested fsevents free of the stray `dev` flag', () => {
    expect(
      packages[FSEVENTS]?.dev,
      `${FSEVENTS} carries \`dev: true\`, which npm recomputes from the tree. An npm below the ` +
        'pin wrote it there in a55222b; remove it, or regenerate the lockfile with the pinned npm.',
    ).toBeUndefined();
  });
});
