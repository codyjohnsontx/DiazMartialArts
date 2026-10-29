import type { Die } from '@/content/dice';

/** A source of numbers in [0, 1), `Math.random` by default. Injected so tests can pin a roll. */
export type Random = () => number;

/** The index of one face of `die`, uniform over its faces. */
export function rollDie(die: Die, random: Random = Math.random): number {
  // `random` stays below 1, so the floor stays below `faces.length`; the clamp
  // only guards an injected source that returns exactly 1.
  return Math.min(Math.floor(random() * die.faces.length), die.faces.length - 1);
}

/**
 * The roll as one sentence, for the live region that announces it: a visitor
 * on a screen reader hears the whole result once the dice settle rather than
 * each die's face changing under the tumble. A die not yet rolled (null) is
 * left out, so re-rolling one die before the others have been rolled reads
 * only that die.
 */
export function describeRoll(dice: readonly Die[], roll: readonly (number | null)[]): string {
  return dice
    .flatMap((die, i) => {
      const face = roll[i];
      return face === null || face === undefined ? [] : [`${die.name}: ${die.faces[face].label}.`];
    })
    .join(' ');
}
