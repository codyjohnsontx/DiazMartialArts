/**
 * Intrinsic size of a JPEG, PNG or WebP, read straight from its header bytes.
 *
 * Reading the header in Node rather than decoding the file in a browser is the
 * point: it keeps the check off the Next.js image optimizer's work queue, which
 * is what made the flyer assertion load-dependent. See the note in
 * tests/e2e/public-pages.spec.ts. No Next.js imports.
 */
export type ImageSize = { width: number; height: number };

/** PNG stores width and height as big-endian uint32s in the IHDR chunk. */
function pngSize(bytes: Buffer): ImageSize | null {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (bytes.length < 24 || !bytes.subarray(0, 8).equals(signature)) return null;
  if (bytes.subarray(12, 16).toString('ascii') !== 'IHDR') return null;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

/**
 * JPEG stores its size in whichever "start of frame" segment the encoder chose,
 * so walk the segment chain to find it. C4, C8 and CC sit in the same numeric
 * range but are Huffman/arithmetic tables rather than frames.
 */
function jpegSize(bytes: Buffer): ImageSize | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;

  let i = 2;
  while (i + 9 < bytes.length) {
    if (bytes[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = bytes[i + 1];
    // 0xFF is padding before the real marker; D0-D9 carry no length field.
    if (marker === 0xff) {
      i += 1;
      continue;
    }
    if (marker >= 0xd0 && marker <= 0xd9) {
      i += 2;
      continue;
    }
    const isStartOfFrame =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isStartOfFrame) {
      return { height: bytes.readUInt16BE(i + 5), width: bytes.readUInt16BE(i + 7) };
    }
    i += 2 + bytes.readUInt16BE(i + 2);
  }
  return null;
}

/**
 * WebP is a RIFF container whose first chunk says which of three encodings it
 * holds, and each stores the canvas size differently. All three are read here
 * rather than only the one the site happens to ship today: a reader that
 * understands part of a format fails on the rest as if the file were corrupt.
 *
 * This matters on this site because a file's extension does not decide its
 * format - `public/bjj.jpg` and `public/lil-dragon.jpg` are both WebP - so a
 * JPEG/PNG-only reader called them unreadable.
 */
function webpSize(bytes: Buffer): ImageSize | null {
  if (bytes.length < 30) return null;
  if (bytes.subarray(0, 4).toString('ascii') !== 'RIFF') return null;
  if (bytes.subarray(8, 12).toString('ascii') !== 'WEBP') return null;

  const chunk = bytes.subarray(12, 16).toString('ascii');

  // Extended: a 24-bit canvas width-1 and height-1 after 4 bytes of flags.
  if (chunk === 'VP8X') {
    return {
      width: bytes.readUIntLE(24, 3) + 1,
      height: bytes.readUIntLE(27, 3) + 1,
    };
  }

  // Lossy: a keyframe whose 3-byte start code is followed by two 14-bit sizes.
  if (chunk === 'VP8 ') {
    if (bytes[23] !== 0x9d || bytes[24] !== 0x01 || bytes[25] !== 0x2a) return null;
    return {
      width: bytes.readUInt16LE(26) & 0x3fff,
      height: bytes.readUInt16LE(28) & 0x3fff,
    };
  }

  // Lossless: 14 bits of width-1 then 14 of height-1, packed after the 0x2f
  // signature byte.
  if (chunk === 'VP8L') {
    if (bytes[20] !== 0x2f) return null;
    const packed = bytes.readUInt32LE(21);
    return {
      width: (packed & 0x3fff) + 1,
      height: ((packed >> 14) & 0x3fff) + 1,
    };
  }

  return null;
}

/** Null when the bytes are not a JPEG, PNG or WebP this reader understands. */
export function imageSize(bytes: Buffer): ImageSize | null {
  return pngSize(bytes) ?? jpegSize(bytes) ?? webpSize(bytes);
}
