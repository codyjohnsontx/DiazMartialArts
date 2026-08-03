import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    include: ['tests/unit/**/*.test.ts', 'tests/components/**/*.test.tsx'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['tests/setup/vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'lib/**/*.ts',
        'components/Button.tsx',
        'components/ContactForm.tsx',
        'components/FaqAccordion.tsx',
        'components/HomeUpcomingClasses.tsx',
        'components/OndemandWaitlistForm.tsx',
        'components/ScheduleContent.tsx',
      ],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },
  },
});
