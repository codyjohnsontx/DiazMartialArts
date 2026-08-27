// Coach profiles behind /coaches. The head instructor's rank line, bio and
// credentials are owner-approved copy, recorded a second time and verbatim in
// tests/e2e/public-pages.spec.ts so an edit here fails the gate rather than
// reaching the site quietly. Change both together; the comment above that
// file's copy explains why the duplication is deliberate.

export type CoachCredential = {
  /** The rank, degree, title or certification, exactly as the school states it. */
  rank: string;
  /** Who it was earned under. Rendered after the word "under". */
  under: string;
};

export type CoachCredentialGroup = {
  /** Short discipline family heading, e.g. "Striking". */
  group: string;
  entries: CoachCredential[];
};

export type Coach = {
  name: string;
  /** Rank line shown directly under the name. */
  rank: string;
  /** Bio paragraphs in order. The first one renders as the page's lead paragraph. */
  bio: string[];
  credentials: CoachCredentialGroup[];
  image: string;
};

export const coaches: Coach[] = [
  {
    name: 'Coach Eddie Diaz',
    rank: '8th Degree Grandmaster · Chief Head Instructor',
    // The tenure figure below ("28 years") is hand-maintained: nothing here
    // derives it from a date, so it only changes when the owner updates it.
    bio: [
      'Training since December 1989. Leading Diaz Martial Arts as owner and Chief Head Instructor for 28 years.',
      "His work has shaped instruction well beyond one school. He served as senior consultant for United Professionals and head instructor of East West Karate in Coral Springs, Florida. In 2001 he joined the corporate headquarters of Black Belt Schools International, helping schools across the country strengthen their programs and contributing to the Instructor's College curriculum. He has produced and been featured in multiple instructional video series for Century Martial Arts.",
      'He holds grandmaster rank in three Filipino martial arts and black belt rank in six more disciplines, earned under some of the most respected names in the industry - and he still trains with them.',
    ],
    credentials: [
      {
        group: 'Filipino martial arts & JKD',
        entries: [
          {
            rank: 'Kali - 8th Degree Black Belt, Grandmaster',
            under: 'Grandmaster John Bruce Daniels',
          },
          {
            rank: 'Escrido - 8th Degree Black Belt, Grandmaster',
            under: 'Grandmaster John Bruce Daniels',
          },
          {
            rank: 'Arnis - 8th Degree Black Belt, Grandmaster',
            under: 'Grandmaster John Bruce Daniels',
          },
          { rank: 'Jeet Kune Do - Full Instructor', under: 'John Bruce Daniels' },
        ],
      },
      {
        group: 'Traditional',
        // The source material gives this rank a degree and its teachers but no
        // discipline. That gap is with the owner as an open question, so leave
        // the art unnamed rather than inferring one.
        entries: [
          {
            rank: '7th Degree Black Belt, Shihan',
            under: 'Professor Larry Hilton & Hanshi John Geyston',
          },
          { rank: 'Tae Kwon Do - 6th Degree Black Belt', under: 'Master Ronald Brett Brown' },
        ],
      },
      {
        group: 'Striking',
        entries: [
          {
            rank: 'American Kickboxing - 2nd Degree Black Belt',
            under: 'Bill "Superfoot" Wallace',
          },
          { rank: 'Muay Thai (Chute Boxe) - Kru', under: 'Luiz Charneski' },
          { rank: 'Muay Lao Kickboxing - Arjan', under: 'Arjan John Bruce Daniels' },
        ],
      },
      {
        group: 'Grappling',
        entries: [
          {
            rank: 'Brazilian Jiu-Jitsu - 2nd Degree Black Belt, Instructor Bars',
            under: 'Frank "King" Webb / Coral Belt Cleber Luciano',
          },
        ],
      },
      {
        group: 'Reality-based self defense',
        entries: [
          { rank: 'HagAnaH - 4th Degree, Master Instructor', under: 'Mike Lee Kanarek' },
          { rank: 'Blade Artist (HagAnaH) - 2nd Degree Black Belt', under: 'Mike Lee Kanarek' },
          {
            rank: 'F.I.G.H.T. Instructor · Ground Survival · I.K.T. Instructor',
            under: 'Mike Lee Kanarek',
          },
          { rank: 'I.P.T.T. Instructor', under: 'Mike Lee Kanarek & Garret Machine' },
        ],
      },
    ],
    image: '/images/coaches/eddie.avif',
  },
];
