import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { imageSize } from '../fixtures/imageSize';

const publicFile = (name: string) => readFileSync(join(process.cwd(), 'public', name));

/**
 * `imageSize` is a byte-level header parser, and a parser that understands part
 * of a format reports the rest as corrupt rather than as unsupported - which is
 * how `public/bjj.jpg`, a WebP carrying a `.jpg` extension, read as "not a
 * readable JPEG or PNG" to tests/e2e/home.spec.ts. The sizes below are ground
 * truth from `sips -g pixelWidth -g pixelHeight`.
 */
describe('imageSize', () => {
  it('reads a PNG', () => {
    expect(imageSize(publicFile('diaz_logo.png'))).toEqual({ width: 169, height: 169 });
  });

  it('reads a JPEG', () => {
    // A flyer, because tests/e2e/public-pages.spec.ts checks every one of them
    // against the dimensions the page declares.
    expect(imageSize(publicFile('announcements/back-to-school-special.jpeg'))).not.toBeNull();
  });

  // Extension and format disagree on both of these, which is the case that
  // started this: they are WebP files named .jpg.
  it.each([
    ['bjj.jpg', 960, 639],
    ['lil-dragon.jpg', 1080, 719],
    ['muaythai.webp', 680, 453],
  ])('reads extended WebP (VP8X) %s', (name, width, height) => {
    expect(imageSize(publicFile(name as string))).toEqual({ width, height });
  });

  // No asset in the repo is lossy or lossless WebP today, so these are built by
  // hand rather than left as branches nothing exercises.
  it('reads lossy WebP (VP8)', () => {
    const bytes = Buffer.alloc(30);
    bytes.write('RIFF', 0, 'ascii');
    bytes.write('WEBP', 8, 'ascii');
    bytes.write('VP8 ', 12, 'ascii');
    bytes[23] = 0x9d;
    bytes[24] = 0x01;
    bytes[25] = 0x2a;
    // The top two bits of each 16-bit field are a scale, not size.
    bytes.writeUInt16LE(640 | (0b01 << 14), 26);
    bytes.writeUInt16LE(480 | (0b10 << 14), 28);
    expect(imageSize(bytes)).toEqual({ width: 640, height: 480 });
  });

  it('reads lossless WebP (VP8L)', () => {
    const bytes = Buffer.alloc(30);
    bytes.write('RIFF', 0, 'ascii');
    bytes.write('WEBP', 8, 'ascii');
    bytes.write('VP8L', 12, 'ascii');
    bytes[20] = 0x2f;
    bytes.writeUInt32LE((640 - 1) | ((480 - 1) << 14), 21);
    expect(imageSize(bytes)).toEqual({ width: 640, height: 480 });
  });

  // Pinned because tests/e2e/home.spec.ts asserts a non-zero width separately
  // and says there why that is not redundant: unlike the WebP branches, which
  // derive size from a stored value-minus-one and so never reach 0, the JPEG
  // and PNG branches report whatever the header holds.
  it('reads a zero size out of a JPEG that declares one, rather than rejecting it', () => {
    const bytes = Buffer.alloc(12);
    bytes[0] = 0xff;
    bytes[1] = 0xd8; // start of image
    bytes[2] = 0xff;
    bytes[3] = 0xc0; // SOF0
    bytes.writeUInt16BE(17, 4); // segment length
    bytes[6] = 8; // sample precision
    bytes.writeUInt16BE(0, 7); // height
    bytes.writeUInt16BE(0, 9); // width
    expect(imageSize(bytes)).toEqual({ width: 0, height: 0 });
  });

  it.each([
    ['bytes that are not an image at all', Buffer.from('not an image, just text')],
    ['a RIFF container that is not WebP', Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(26)])],
    ['a truncated WebP header', Buffer.from('RIFF\0\0\0\0WEBPVP8X')],
  ])('returns null for %s', (_label, bytes) => {
    expect(imageSize(bytes as Buffer)).toBeNull();
  });
});
