# 2.0.0 (2026-11-04)

Breaking changes:

- Replace the `HtmlLightweightTemplateEngine` class with `render(data, options)`.
- Use native `<template id="name">` elements instead of `<app-template>`.
- Rename the container attribute from `appTemplateOutlet` to `template`.
- Insert values as text instead of HTML.
- Ship as ESM only (`dist/index.js`). The script tag build stays at
  `dist/html-lightweight-template-engine.min.js`.

Other changes:

- Add `interpolate(text, data)`.
- Add the `root` option to render only part of the page.
- Support templates inside templates.
- Replace placeholders in attribute values.
- Keep event listeners on existing elements.
- Skip `<script>` and `<style>` contents.
- Render empty string values instead of falling back to the key.
- `render` can be called more than once.
- Build with esbuild instead of Rollup.
- Add tests.

# 1.3.0 (2023-06-10)

Remove the downloads tag from `README.md`.

# 1.1.0 (2023-04-30)

- Add Rollup config
- Add ESLint
- Add the support for ESM
- Add TypeScript definition file
