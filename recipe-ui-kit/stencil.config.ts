import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'recipe-ui-kit',

  // Emitted to `dist/recipe-ui-kit/recipe-ui-kit.css` so host apps can opt into
  // the design tokens with a single import.
  globalStyle: 'src/global/tokens.css',

  outputTargets: [
    // `dist` powers the lazy `/loader` entry point that the SvelteKit app uses:
    // one small script registers every tag and fetches component code on demand.
    {
      type: 'dist',
      esmLoaderPath: '../loader',
      // Lets Stencil validate that package.json's `module`, `types` and
      // `collection` fields actually point at this target's output.
      isPrimaryPackageOutputTarget: true,
    },
    // `dist-custom-elements` lets consumers tree-shake individual components
    // instead of pulling in the whole kit.
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      generateTypeDeclarations: true,
      externalRuntime: false,
    },
    // Keeps each component's readme.md in sync with its props, events and slots.
    {
      type: 'docs-readme',
    },
    // Local demo page served by `npm start`. Not published.
    {
      type: 'www',
      serviceWorker: null,
    },
  ],

  validatePrimaryPackageOutputTarget: true,
}
