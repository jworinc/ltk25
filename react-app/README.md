# React + TypeScript + Vite

## LTK React Migration: Architecture, Utilities, and Testing

This project is a migration from Angular to React, with a focus on maintainability, modern React patterns, and feature parity.

---

## 🏗️ Architecture Overview

- **Hooks & Services:** Core logic is implemented as custom React hooks in `src/services/` (e.g., `useOptions`, `useColorScheme`, `useHelp`, `useLogging`).
- **Providers/Contexts:**
  - `useAuth` is wrapped in an `AuthProvider` for global authentication state.
  - If you need global language, theme, or options state, refactor `useOptions` and `useColorScheme` into Context Providers.
- **Harnesses:** Each major hook/service has a corresponding Harness component for interactive testing and demo.
- **Utilities:** Utility functions (ported from Angular pipes) are in `src/services/utils.ts`.

---

## 🛠️ Utility Functions (Pipes Ported)

- `langFilter(items, sku)`: Filters items by locales in `sku.languages` (comma-separated string).
- `reverseArray(arr)`: Returns a reversed copy of an array.
- `filterByArray(items, arr)`: Filters items whose `menu_id` is in `arr`.
- `sanitizeHtml(html)`: Returns HTML string (placeholder, use DOMPurify for real sanitization).

---

## 🎨 Theming

- Use the `useColorScheme` hook for light/dark mode or custom themes.
- For global theming, refactor to a `ThemeProvider` using React Context and CSS variables.

---

## 🧪 Testing Strategy

- All utilities and hooks should have corresponding tests (see `src/services/utils.test.ts`).
- Use [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for unit and integration tests.
- Run tests with `npm test` or `yarn test`.

---

## 📚 Documentation & Comments

- All hooks, components, and utilities should have JSDoc-style comments.
- Update this README when new architectural patterns or utilities are added.

---


Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
