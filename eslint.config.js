import tseslint from 'typescript-eslint';

// Mode A — Page Builder Studio tool. Unrestricted (Tailwind, any libs, any icons).
const PAGE_BUILDER_STUDIO = ['src/page-builder-studio/**/*.{ts,tsx}'];

// Focused config: ONLY the high-value / low-noise `no-restricted-imports` enforcement.
// We intentionally do NOT enable eslint/typescript-eslint "recommended" rule sets yet —
// they would flood the existing codebase with unrelated errors and make `pnpm lint` fail
// for reasons that have nothing to do with the design system. Start with imports; tighten later.
export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
    ],
  },

  // ---- Base: TypeScript/JSX parser for ALL src files (both modes) so nothing fails to parse ----
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },

  // ---- MODE B: mandatory design-system rules (everything EXCEPT Page Builder Studio) ----
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: PAGE_BUILDER_STUDIO,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'lucide-react',
              message: 'Mode B: icons must use Font Awesome (<i className="fa-regular fa-...">). See CLAUDE.md rule 3.' },
            { name: 'recharts',
              message: 'Mode B: charts must use DevExtreme (devextreme-react/chart). See CLAUDE.md rule 4.' },
            { name: 'antd',
              message: 'Mode B: no Ant Design. Use DevExtreme + Bootstrap. See CLAUDE.md rule 6.' },
          ],
          patterns: [
            { group: ['lucide-react/*'],
              message: 'Mode B: icons must use Font Awesome. See CLAUDE.md rule 3.' },
            { group: ['@mui/*'],
              message: 'Mode B: no MUI. Use DevExtreme + Bootstrap. See CLAUDE.md rule 6.' },
            { group: ['@radix-ui/*'],
              message: 'Mode B: no Radix. Use DevExtreme/Bootstrap or the ui-kit wrappers. See CLAUDE.md rule 6.' },
            { group: ['**/components/ui', '**/components/ui/*'],
              message: 'Mode B: the shadcn ui/ folder is deprecated. Use src/app/components/ui-kit/*. See Improvement.md §5b.' },
          ],
        },
      ],
    },
  },

  // ---- MODE A: Page Builder Studio — explicitly unrestricted ----
  {
    files: PAGE_BUILDER_STUDIO,
    rules: {
      'no-restricted-imports': 'off',
    },
  },
);
