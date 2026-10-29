// The jiu jitsu dice on /dice. Each die here is one twenty-sided die; a roll
// picks one face from each, and the pair drills what the faces say.
//
// Coaches edit the technique lists here and nowhere else. The rules the page
// relies on, and that tests/unit/dice.test.ts enforces:
// - every die has exactly DIE_SIDES faces (it is a d20), each a short `label`
//   with no duplicates on the same die;
// - `id` is stable and unique across the set, because it keys the roll;
// - `prompt` is the one line under the die's name telling the pair what to do
//   with the face that came up;
// - `youtubeId`, when given, is the eleven-character id from a YouTube URL
//   (the part after `watch?v=`). The page shows that video's own thumbnail
//   under the rolled die and plays it, on tap, in the privacy-enhanced
//   embed. Leave it out and the die says there is no video yet rather than
//   showing a broken one. Every id here was checked against YouTube's oEmbed
//   endpoint when it was added, which is the check for "exists and can be
//   embedded"; a video later made private fails there too, so re-run that
//   check if a face stops playing.
// Order the faces however reads best; the roll is uniform over all of them.
//
// This set is a drafted one. The physical d20 set that prompted the page could
// not be read when it was built (Reddit blocks automated readers), so the three
// dice below are a sensible open-mat set rather than a copy of anyone's design:
// a starting position, a submission to hunt from wherever the round goes, and a
// sweep or pass to work on the way there.

export const DIE_SIDES = 20;

export type Face = {
  label: string;
  youtubeId?: string;
};

export type Die = {
  id: string;
  name: string;
  prompt: string;
  faces: readonly Face[];
};

export const dice: readonly Die[] = [
  {
    id: 'position',
    name: 'Position',
    prompt: 'Start the round here.',
    faces: [
      { label: 'Closed guard (bottom)', youtubeId: 'KKxD5kdOkk0' },
      { label: 'Closed guard (top)', youtubeId: 'nAEWx5bsv0g' },
      { label: 'Half guard (bottom)', youtubeId: '15kus9CLg2s' },
      { label: 'Half guard (top)', youtubeId: 'GYq1cv9mCdg' },
      { label: 'Butterfly guard (bottom)', youtubeId: '-wftJg6jm3E' },
      { label: 'De La Riva guard (bottom)', youtubeId: 'xa0c5HHTuhM' },
      { label: 'Spider guard (bottom)', youtubeId: 'qpmc6uClx4o' },
      { label: 'Open guard (top, standing)', youtubeId: '7v_M_ea_7Ik' },
      { label: 'Side control (top)', youtubeId: '5dRzDEnFTqY' },
      { label: 'Side control (bottom)', youtubeId: 'CJrKkymdkGI' },
      { label: 'Mount (top)', youtubeId: '_1CrMowmTwc' },
      { label: 'Mount (bottom)', youtubeId: 'SYel-mVSMAI' },
      { label: 'Back control (attacking)', youtubeId: 'CFDVh9EVgPA' },
      { label: 'Back control (defending)', youtubeId: 'Bg4dpg3N5Is' },
      { label: 'Knee on belly (top)', youtubeId: 'VOBpU-CkND0' },
      { label: 'Knee on belly (bottom)', youtubeId: 'DXY62BhR-nQ' },
      { label: 'North-south (top)', youtubeId: '7yLV8MRp6Vc' },
      { label: 'Turtle (top)', youtubeId: '_ZIC3w_Dg3Y' },
      { label: 'Turtle (bottom)', youtubeId: '-BYPW3FwG7I' },
      { label: 'Standing', youtubeId: '4pIMEAKrqcY' },
    ],
  },
  {
    id: 'submission',
    name: 'Submission',
    prompt: 'Hunt this finish wherever the round goes.',
    faces: [
      { label: 'Armbar', youtubeId: 'XUrxSihViJI' },
      { label: 'Triangle choke', youtubeId: '20j7LcZ5xRY' },
      { label: 'Kimura', youtubeId: 'mVkKOPNGvjA' },
      { label: 'Americana', youtubeId: 'CYRLrmcZRCc' },
      { label: 'Omoplata', youtubeId: 'Lk4mv2p1mz8' },
      { label: 'Rear naked choke', youtubeId: '0Q4pp5eF9D0' },
      { label: 'Guillotine', youtubeId: 'UbcqJETDUY8' },
      { label: 'Bow and arrow choke', youtubeId: 'r8rP85rJIJ8' },
      { label: 'Cross collar choke', youtubeId: '2u7-QUtUnN4' },
      { label: 'Ezekiel choke', youtubeId: 'yHO94aconmo' },
      { label: 'Loop choke', youtubeId: 'SNASDxyjcAA' },
      { label: 'Arm triangle', youtubeId: 'XMN6eFY0u-g' },
      { label: "D'Arce choke", youtubeId: 'VOliFfkp5Ik' },
      { label: 'Anaconda choke', youtubeId: 'Q8KO-Ncfrfo' },
      { label: 'Straight ankle lock', youtubeId: 'cmimzr_oNbw' },
      { label: 'Kneebar', youtubeId: 'oBlMI4iKm3c' },
      { label: 'Toe hold', youtubeId: 'kuNAhRf--Po' },
      { label: 'Wrist lock', youtubeId: 'I0MN4sIiXME' },
      { label: 'Baseball bat choke', youtubeId: 'mBcQiWrIdhs' },
      { label: 'North-south choke', youtubeId: 'fyqluZ0CAXI' },
    ],
  },
  {
    id: 'transition',
    name: 'Sweep or pass',
    prompt: 'Bottom works the sweep; top works the pass.',
    faces: [
      { label: 'Scissor sweep', youtubeId: 'UBf7uF5x8GQ' },
      { label: 'Hip bump sweep', youtubeId: '3Ekj6-XZTu4' },
      { label: 'Flower sweep', youtubeId: 'RYq3p88IcE8' },
      { label: 'Butterfly sweep', youtubeId: 'x7Wv0w9EEcc' },
      { label: 'Elevator sweep', youtubeId: 'awCHI_VFJQI' },
      { label: 'Tripod sweep', youtubeId: 'GTPzfkqPo8c' },
      { label: 'Sickle sweep', youtubeId: 'MV0iZDE1izc' },
      { label: 'Old school sweep', youtubeId: '-S1lhWAX2ps' },
      { label: 'Lumberjack sweep', youtubeId: 'QOXCJFEI78Y' },
      { label: 'Waiter sweep', youtubeId: 'LzphtRQwv6g' },
      { label: 'Knee cut pass', youtubeId: 'jiBiDvrz9iw' },
      { label: 'Toreando pass', youtubeId: 'i9rA2rDb05k' },
      { label: 'Over-under pass', youtubeId: '4hAY12ghrGk' },
      { label: 'Double under pass', youtubeId: 'OK8VEPdxzMM' },
      { label: 'Leg drag pass', youtubeId: 'n596l_pJi-E' },
      { label: 'Smash pass', youtubeId: 'BcnjgHwB6hk' },
      { label: 'X-pass', youtubeId: '8huFMFJPsZM' },
      { label: 'Long step pass', youtubeId: 'zdLtxVHygMQ' },
      { label: 'Body lock pass', youtubeId: 'ce7g__eV5iA' },
      { label: 'Folding pass', youtubeId: 'cqnnbaIO828' },
    ],
  },
];
