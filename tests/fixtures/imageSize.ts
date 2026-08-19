/**
 * Intrinsic size of a JPEG or PNG, read straight from its header bytes.
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

/** Null when the bytes are not a JPEG or PNG this reader understands. */
export function imageSize(bytes: Buffer): ImageSize | null {
  return pngSize(bytes) ?? jpegSize(bytes);
}
