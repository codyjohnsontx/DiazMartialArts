import { describe, expect, it } from 'vitest';

import { dice, DIE_SIDES } from '@/content/dice';
import { describeRoll, rollDie } from '@/lib/dice';
import { isYouTubeId, youtubeEmbedUrl, youtubeThumbnailUrl } from '@/lib/youtube';

// content/dice.ts is the one place coaches edit the technique lists, so these
// are the rules an edit there has to keep: a die is a d20, a face is a short
// unique label, and an id is stable because it keys the roll.
describe('content/dice', () => {
  it('ships three dice with unique ids', () => {
    expect(dice).toHaveLength(3);
    expect(new Set(dice.map((die) => die.id)).size).toBe(dice.length);
  });

  for (const die of dice) {
    describe(die.name, () => {
      it(`has exactly ${DIE_SIDES} faces`, () => {
        expect(die.faces).toHaveLength(DIE_SIDES);
      });

      it('has no blank, padded or duplicate faces', () => {
        for (const { label } of die.faces) {
          expect(label).toBe(label.trim());
          expect(label.length).toBeGreaterThan(0);
        }
        expect(new Set(die.faces.map((face) => face.label)).size).toBe(die.faces.length);
      });

      // A malformed id would render a broken thumbnail and an empty player;
      // the field is optional precisely so a face with no video omits it.
      it('gives every face either a well-formed YouTube id or none', () => {
        for (const face of die.faces) {
          if (face.youtubeId !== undefined) {
            expect(isYouTubeId(face.youtubeId), `${face.label}: "${face.youtubeId}"`).toBe(true);
          }
        }
      });

      it('tells the pair what to do with the face', () => {
        expect(die.prompt.trim().length).toBeGreaterThan(0);
      });
    });
  }
});

describe('rollDie', () => {
  const [position] = dice;

  it('maps the whole [0, 1) range onto the faces, first to last', () => {
    expect(rollDie(position, () => 0)).toBe(0);
    expect(rollDie(position, () => 0.5)).toBe(DIE_SIDES / 2);
    expect(rollDie(position, () => 0.999)).toBe(DIE_SIDES - 1);
  });

  it('never indexes past the last face even for a source that returns 1', () => {
    expect(rollDie(position, () => 1)).toBe(DIE_SIDES - 1);
  });

  it('reaches every face', () => {
    const seen = new Set<number>();
    for (let i = 0; i < 5000; i += 1) seen.add(rollDie(position));
    expect(seen.size).toBe(DIE_SIDES);
  });
});

describe('describeRoll', () => {
  it('reads the roll as one sentence per die, in die order', () => {
    expect(describeRoll(dice, [0, 1, 2])).toBe(
      `Position: ${dice[0].faces[0].label}. Submission: ${dice[1].faces[1].label}. Sweep or pass: ${dice[2].faces[2].label}.`,
    );
  });

  it('leaves out a die that has not been rolled', () => {
    expect(describeRoll(dice, [null, 4, null])).toBe(`Submission: ${dice[1].faces[4].label}.`);
  });
});

describe('youtube', () => {
  it('accepts an eleven-character id and nothing else', () => {
    expect(isYouTubeId('dQw4w9WgXcQ')).toBe(true);
    expect(isYouTubeId('a-b_C1234xy')).toBe(true);
    expect(isYouTubeId('')).toBe(false);
    expect(isYouTubeId('dQw4w9WgXc')).toBe(false);
    expect(isYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe(false);
    expect(isYouTubeId('dQw4w9WgXcQ&t=1')).toBe(false);
  });

  // The still comes from YouTube's own image host, and the player from the
  // privacy-enhanced embed host, with autoplay because the player is only
  // created once the visitor has tapped to ask for it.
  it('derives the still and the player from the same id', () => {
    expect(youtubeThumbnailUrl('dQw4w9WgXcQ')).toBe(
      'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    );
    expect(youtubeEmbedUrl('dQw4w9WgXcQ')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&autoplay=1',
    );
  });
});
