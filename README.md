# HTML Lightweight Template Engine

[![npm version](https://img.shields.io/npm/v/html-lightweight-template-engine.svg)](https://www.npmjs.com/package/html-lightweight-template-engine)
[![license](https://img.shields.io/npm/l/html-lightweight-template-engine.svg)](https://www.npmjs.com/package/html-lightweight-template-engine)

A small library for plain HTML pages. It replaces `{{ key }}` placeholders
with your values, and lets you reuse a piece of HTML in several places with
`<template>` and `<app-container>` (similar to `ng-template` and
`ng-container` in Angular). No framework needed.

## Installation

```console
npm i html-lightweight-template-engine
```

```js
import { render } from 'html-lightweight-template-engine'
```

Or with a script tag. The functions are then available on the
`htmlLightweightTemplateEngine` global:

```html
<script src="https://cdn.jsdelivr.net/npm/html-lightweight-template-engine@2/dist/html-lightweight-template-engine.min.js"></script>
```

## Example

A product page that uses every feature: placeholders in text and attributes,
numbers, keys with dots, templates that are reused and nested, a part of the
page rendered on its own with a custom prefix, and `interpolate`.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <!-- Placeholders work in the page title -->
    <title>{{ product.name }} | {{ shopName }}</title>
    <style>
      /* Not touched: {{ product.name }} */
      .star { color: gold; }
    </style>
  </head>
  <body>
    <!-- A template that contains another template -->
    <app-container template="header"></app-container>

    <main>
      <!-- Text and attribute values -->
      <h1>{{ product.name }}</h1>
      <img src="{{ product.image }}" alt="{{ product.name }}" width="200" />

      <!-- Numbers -->
      <p>{{ product.price }} {{ currency }}</p>

      <!-- The same template used several times -->
      <p>
        <app-container template="star"></app-container>
        <app-container template="star"></app-container>
        <app-container template="star"></app-container>
        ({{ reviewCount }} reviews)
      </p>

      <!-- Values are inserted as text, not HTML -->
      <p>{{ product.description }}</p>

      <!-- An empty value renders as nothing -->
      <p>{{ discount }}</p>

      <!-- A missing key renders as the key name -->
      <p>{{ deliveryInfo }}</p>

      <button id="buy">{{ buyLabel }}</button>
    </main>

    <!-- Rendered separately, with its own data and prefix -->
    <aside id="newsletter">
      <ui-container template="signup"></ui-container>
    </aside>

    <template id="header">
      <header>
        <app-container template="logo"></app-container>
        <a href="/cart">Cart ({{ cartCount }})</a>
      </header>
    </template>

    <template id="logo">
      <strong>{{ shopName }}</strong>
    </template>

    <template id="star">
      <span class="star">★</span>
    </template>

    <template id="signup">
      <p>{{ title }}</p>
      <input type="email" placeholder="{{ placeholder }}" />
    </template>

    <script src="https://cdn.jsdelivr.net/npm/html-lightweight-template-engine@2/dist/html-lightweight-template-engine.min.js"></script>
    <script>
      const { render, interpolate } = htmlLightweightTemplateEngine

      // Listeners added before rendering keep working
      document.getElementById('buy').addEventListener('click', () => {
        alert(interpolate('{{ name }} added to cart', { name: 'Desk Lamp' }))
      })

      // Render the newsletter box first. A render of the whole page would
      // otherwise replace {{ title }} with "title" and leave <ui-container>.
      render(
        { title: 'Get 10% off your first order', placeholder: 'you@example.com' },
        { root: document.getElementById('newsletter'), prefix: 'ui' }
      )

      // Then render the rest of the page
      render({
        shopName: 'Lumen Shop',
        cartCount: 2,
        currency: 'USD',
        reviewCount: 128,
        discount: '',
        buyLabel: 'Add to cart',
        'product.name': 'Desk Lamp',
        'product.image': 'lamp.jpg',
        'product.price': 49.99,
        'product.description': 'Warm, dimmable light. <b>Free shipping!</b>'
      })
    </script>
  </body>
</html>
```

Result (page title: `Desk Lamp | Lumen Shop`):

```html
<header>
  <strong>Lumen Shop</strong>
  <a href="/cart">Cart (2)</a>
</header>

<main>
  <h1>Desk Lamp</h1>
  <img src="lamp.jpg" alt="Desk Lamp" width="200" />
  <p>49.99 USD</p>
  <p>
    <span class="star">★</span>
    <span class="star">★</span>
    <span class="star">★</span>
    (128 reviews)
  </p>
  <p>Warm, dimmable light. &lt;b&gt;Free shipping!&lt;/b&gt;</p>
  <p></p>
  <p>deliveryInfo</p>
  <button id="buy">Add to cart</button>
</main>

<aside id="newsletter">
  <p>Get 10% off your first order</p>
  <input type="email" placeholder="you@example.com" />
</aside>
```

Clicking the button shows "Desk Lamp added to cart". The `<style>` and
`<script>` contents and the `<template>` elements stay as they are.

## API

### `render(data, options?)`

Renders the page, or part of it, in place:

1. Each `<app-container template="id">` is replaced with the content of
   `<template id="id">`. Templates can contain other containers.
2. Each `{{ key }}` in text and in attribute values is replaced with
   `data[key]`.

Values are inserted as text, not HTML, so a value like `<b>hi</b>` shows up
as is. The contents of `<script>` and `<style>` are not touched, and event
listeners on existing elements are kept.

Arguments:

- `data`: an object with string or number values, e.g. `{ title: 'Home' }`.
- `options.root`: the element or document to render. Default: `document`.
- `options.prefix`: the prefix of the container tag. With `prefix: 'my'` the
  tag is `<my-container>`. Default: `'app'`.

Throws an error if a container points to a template that doesn't exist.

### `interpolate(text, data)`

Replaces `{{ key }}` placeholders in a string and returns the result.

```js
interpolate('Hello, {{ name }}!', { name: 'Mia' }) // 'Hello, Mia!'
```

Keys can contain letters, numbers, `_`, `-` and `.`. If a key is missing
from `data`, the placeholder is replaced with the key itself, so
`{{ greeting }}` becomes `greeting`.

## Upgrading from 1.x

- The `HtmlLightweightTemplateEngine` class is replaced by `render`:

  ```js
  // 1.x
  new HtmlLightweightTemplateEngine(texts, 'app').renderTemplate()
  // 2.x
  render(texts, { prefix: 'app' })
  ```

- Use `<template id="name">` instead of `<app-template name>`, and
  `<app-container template="name">` instead of
  `<app-container appTemplateOutlet="name">`.
- Values are inserted as text instead of HTML.
- Empty string values render as empty strings instead of the key.
- The npm package is ESM only. For non-module code use the script tag build.

## Development

```console
npm install
npm test
npm run lint
npm run build
```

`npm run npm-publish` runs the checks, builds the package and publishes it to
npm.

## License

ISC
