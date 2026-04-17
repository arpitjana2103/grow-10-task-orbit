# React + TypeScript Starter

A minimal starter template using the [OXC](https://oxc.rs) toolchain — fast linting with **oxlint**, fast formatting with **oxfmt** — alongside **React 19**, **TypeScript 6**, and **Vite 8**, with first-class [Zed](https://zed.dev) IDE integration.

No ESLint. No Prettier.

---

## Stack

| Tool                                                                    | Version | Purpose                            |
| ----------------------------------------------------------------------- | ------- | ---------------------------------- |
| [React](https://react.dev)                                              | 19      | UI library                         |
| [TypeScript](https://www.typescriptlang.org)                            | 6       | Type safety                        |
| [Vite](https://vite.dev)                                                | 8       | Dev server & bundler               |
| [oxlint](https://oxc.rs/docs/guide/usage/linter)                        | 1.x     | Linter (replaces ESLint)           |
| [oxfmt](https://oxc.rs/docs/guide/usage/formatter)                      | 0.x     | Formatter (replaces Prettier)      |
| [oxlint-tsgolint](https://github.com/oxc-project/oxlint-tsgolint)       | 0.x     | TypeScript-go lint rules           |
| [vite-plugin-oxlint](https://github.com/oxc-project/vite-plugin-oxlint) | 2.x     | Lint integration in Vite dev/build |

---

## Prerequisites

- **Node.js** 22 or later
- **npm** 10 or later
- **[Zed](https://zed.dev)** (for IDE integration — optional but recommended)

---

## Getting Started

```sh
# 1. Clone or download the template
git clone <repo-url> my-app
cd my-app

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Scripts

| Script      | Command                | Description                                |
| ----------- | ---------------------- | ------------------------------------------ |
| `dev`       | `vite`                 | Start the Vite development server with HMR |
| `build`     | `tsc -b && vite build` | Type-check then bundle for production      |
| `lint`      | `oxlint ...`           | Run oxlint across the project              |
| `lint:fix`  | `oxlint ... --fix`     | Run oxlint and auto-fix safe issues        |
| `fmt`       | `oxfmt ...`            | Format all files                           |
| `fmt:check` | `oxfmt ... --check`    | Check formatting without writing changes   |

---

## Project Structure

```
.
├── .zed/
│   └── settings.json       # Zed workspace settings (formatter, linter, LSP)
├── public/
│   └── favicon.svg
├── src/
│   ├── App.tsx
│   └── main.tsx
├── .oxfmtrc.json           # oxfmt formatter config
├── .oxlintrc.json          # oxlint linter config
├── index.html
├── tsconfig.json           # Project references root
├── tsconfig.app.json       # Config for src/
├── tsconfig.node.json      # Config for vite.config.ts
└── vite.config.ts
```

---

## Tooling

### oxlint — `.oxlintrc.json`

Linting is configured with category-level severity rather than individual rules:

- `correctness` → **error**
- `suspicious` → **warn**
- `perf` → **warn**
- `style` → **off**

Active plugins: `react`, `import`, `typescript`, `unicorn`, `oxc`.

Type-aware linting is enabled via `"options": { "typeAware": true }`, which lets oxlint use TypeScript type information for deeper checks.

Ignored paths: `dist`, `node_modules`, `vite.config.ts`.

### oxfmt — `.oxfmtrc.json`

- **Tab width:** 4 spaces
- **Import sorting:** enabled, with grouped ordering: side effects → builtins → types → external → internal → local → styles

### vite-plugin-oxlint

`oxlint` is wired into Vite's plugin pipeline, so lint errors surface during `npm run dev` and `npm run build` — not just when running `npm run lint` manually.

---

## Zed IDE Integration — `.zed/settings.json`

The workspace settings configure Zed to use oxlint and oxfmt as first-class language server tools:

- **Format on save** is enabled for all supported languages (TS, TSX, JS, CSS, HTML, JSON, JSONC, YAML, Markdown).
- **Prettier is disabled** project-wide to prevent conflicts with oxfmt.
- **oxlint** runs in `onType` mode with safe auto-fix applied via `source.fixAll.oxc`.
- **oxfmt** runs in `onSave` mode.
- Stale `// oxlint-disable` directives are flagged as errors (`unusedDisableDirectives: "deny"`).

> If you use a different editor, run `npm run lint:fix` and `npm run fmt` manually to stay in sync.

---

## TypeScript Configuration

The project uses TypeScript **project references** — a separate tsconfig for app code and for Vite's config file — which gives accurate type checking in both contexts.

Key flags enabled in both configs:

| Flag                                    | Purpose                                                               |
| --------------------------------------- | --------------------------------------------------------------------- |
| `strict`                                | Full strict mode                                                      |
| `noUnusedLocals` / `noUnusedParameters` | Catch dead code at compile time                                       |
| `verbatimModuleSyntax`                  | Ensures `import type` is used where required                          |
| `moduleDetection: "force"`              | Treats every file as a module, no accidental globals                  |
| `erasableSyntaxOnly`                    | Disallows syntax incompatible with type-stripping (e.g. `const enum`) |
| `noFallthroughCasesInSwitch`            | Prevents missing `break` in switch statements                         |
