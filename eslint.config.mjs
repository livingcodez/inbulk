import nextPlugin from '@next/eslint-plugin-next';

export default [
  {
    ignores: ["node_modules/*", ".next/*", ".out/*"],
  },
  nextPlugin.configs.recommended,
  // Potentially add a section for global languageOptions like ecmaVersion if needed
  // {
  //   languageOptions: {
  //     ecmaVersion: 'latest',
  //     sourceType: 'module',
  //   }
  // }
];
