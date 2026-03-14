import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';

import { schemaTypes } from './sanity/schemaTypes';

export default defineConfig({
  name: 'diaz-martial-arts',
  title: 'Diaz Martial Arts',
  projectId: 'v0x4reaj',
  dataset: 'production',
  basePath: '/studio',
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
});
