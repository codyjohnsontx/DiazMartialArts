// The jiu jitsu dice on /dice. Each die here is one twenty-sided die; a roll
// picks one face from each, and the pair drills what the faces say.
//
// Coaches edit the technique lists here and nowhere else. The rules the page
// relies on, and that tests/unit/dice.test.ts enforces:
// - every die has exactly DIE_SIDES faces (it is a d20), each a short label
//   with no duplicates on the same die;
// - `id` is stable and unique across the set, because it keys the roll;
// - `prompt` is the one line under the die's name telling the pair what to do
//   with the face that came up.
// Order the faces however reads best; the roll is uniform over all of them.
//
// This set is a drafted one. The physical d20 set that prompted the page could
// not be read when it was built (Reddit blocks automated readers), so the three
// dice below are a sensible open-mat set rather than a copy of anyone's design:
// a starting position, a submission to hunt from wherever the round goes, and a
// sweep or pass to work on the way there.

export const DIE_SIDES = 20;

export type Die = {
  id: string;
  name: string;
  prompt: string;
  faces: readonly string[];
};

export const dice: readonly Die[] = [
  {
    id: 'position',
    name: 'Position',
    prompt: 'Start the round here.',
    faces: [
      'Closed guard (bottom)',
      'Closed guard (top)',
      'Half guard (bottom)',
      'Half guard (top)',
      'Butterfly guard (bottom)',
      'De La Riva guard (bottom)',
      'Spider guard (bottom)',
      'Open guard (top, standing)',
      'Side control (top)',
      'Side control (bottom)',
      'Mount (top)',
      'Mount (bottom)',
      'Back control (attacking)',
      'Back control (defending)',
      'Knee on belly (top)',
      'Knee on belly (bottom)',
      'North-south (top)',
      'Turtle (top)',
      'Turtle (bottom)',
      'Standing',
    ],
  },
  {
    id: 'submission',
    name: 'Submission',
    prompt: 'Hunt this finish wherever the round goes.',
    faces: [
      'Armbar',
      'Triangle choke',
      'Kimura',
      'Americana',
      'Omoplata',
      'Rear naked choke',
      'Guillotine',
      'Bow and arrow choke',
      'Cross collar choke',
      'Ezekiel choke',
      'Loop choke',
      'Arm triangle',
      "D'Arce choke",
      'Anaconda choke',
      'Straight ankle lock',
      'Kneebar',
      'Toe hold',
      'Wrist lock',
      'Baseball bat choke',
      'North-south choke',
    ],
  },
  {
    id: 'transition',
    name: 'Sweep or pass',
    prompt: 'Bottom works the sweep; top works the pass.',
    faces: [
      'Scissor sweep',
      'Hip bump sweep',
      'Flower sweep',
      'Butterfly sweep',
      'Elevator sweep',
      'Tripod sweep',
      'Sickle sweep',
      'Old school sweep',
      'Lumberjack sweep',
      'Waiter sweep',
      'Knee cut pass',
      'Toreando pass',
      'Over-under pass',
      'Double under pass',
      'Leg drag pass',
      'Smash pass',
      'X-pass',
      'Long step pass',
      'Body lock pass',
      'Folding pass',
    ],
  },
];
