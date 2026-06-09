import { type Program } from '@/content/programs';
import { site } from '@/content/site';

export function CourseSchema({ program }: { program: Program }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: program.title,
    description: program.description,
    provider: {
      '@type': 'Organization',
      name: site.name,
      sameAs: site.url,
    },
    educationalLevel: program.level,
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: program.age,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}
