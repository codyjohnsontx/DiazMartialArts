import { describe, expect, it } from 'vitest';

import { dice, DIE_SIDES } from '@/content/dice';
import { describeRoll, rollDie } from '@/lib/dice';

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
        for (const face of die.faces) {
          expect(face).toBe(face.trim());
          expect(face.length).toBeGreaterThan(0);
        }
        expect(new Set(die.faces).size).toBe(die.faces.length);
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
      `Position: ${dice[0].faces[0]}. Submission: ${dice[1].faces[1]}. Sweep or pass: ${dice[2].faces[2]}.`,
    );
  });

  it('leaves out a die that has not been rolled', () => {
    expect(describeRoll(dice, [null, 4, null])).toBe(`Submission: ${dice[1].faces[4]}.`);
  });
});
