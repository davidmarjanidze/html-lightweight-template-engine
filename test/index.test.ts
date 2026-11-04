import { GlobalRegistrator } from '@happy-dom/global-registrator'
import assert from 'node:assert/strict'
import { after, beforeEach, describe, test } from 'node:test'

GlobalRegistrator.register()
const { interpolate, render } = await import('../src/index.ts')

after(() => GlobalRegistrator.unregister())

describe('interpolate', () => {
  test('replaces known keys', () => {
    assert.equal(
      interpolate('Hi {{name}}, {{ n }}!', { name: 'Mia', n: 3 }),
      'Hi Mia, 3!'
    )
  })

  test('keeps empty values', () => {
    assert.equal(interpolate('[{{ a }}]', { a: '' }), '[]')
  })

  test('falls back to the key name', () => {
    assert.equal(interpolate('{{ missing }}', {}), 'missing')
  })

  test('ignores inherited properties', () => {
    assert.equal(interpolate('{{ toString }}', {}), 'toString')
  })
})

describe('render', () => {
  beforeEach(() => {
    document.head.innerHTML = '<title>{{ title }}</title>'
    document.body.innerHTML = ''
  })

  test('replaces text and attributes', () => {
    document.body.innerHTML = '<p title="{{ tip }}">{{ greeting }}</p>'
    render({ title: 'Blog', tip: 'Hello', greeting: '<b>Hi</b>' })

    assert.equal(document.title, 'Blog')
    const p = document.querySelector('p')!
    assert.equal(p.getAttribute('title'), 'Hello')
    assert.equal(p.textContent, '<b>Hi</b>')
    assert.equal(p.children.length, 0)
  })

  test('keeps event listeners', () => {
    document.body.innerHTML = '<button>{{ label }}</button>'
    const button = document.querySelector('button')!
    let clicked = false
    button.addEventListener('click', () => (clicked = true))

    render({ label: 'Go' })
    button.click()

    assert.equal(button.textContent, 'Go')
    assert.ok(clicked)
  })

  test('skips script and style contents', () => {
    document.body.innerHTML =
      '<style>/* {{ a }} */</style><script>// {{ a }}</script>'
    render({ a: 'x' })
    assert.match(document.body.innerHTML, /\{\{ a \}\}.*\{\{ a \}\}/s)
  })

  test('fills containers, including nested ones', () => {
    document.body.innerHTML = `
      <app-container template="card"></app-container>
      <template id="card"><div class="card"><app-container template="label"></app-container></div></template>
      <template id="label"><span>{{ text }}</span></template>`
    render({ text: 'Hello' })

    assert.equal(document.querySelector('app-container'), null)
    assert.equal(document.querySelector('.card span')!.textContent, 'Hello')
  })

  test('uses a custom prefix and root', () => {
    document.body.innerHTML = `
      <section><x-container template="t"></x-container><p>{{ a }}</p></section>
      <p id="outside">{{ a }}</p>
      <template id="t"><i>{{ a }}</i></template>`
    render(
      { a: '1' },
      { root: document.querySelector('section')!, prefix: 'x' }
    )

    assert.equal(document.querySelector('section')!.textContent, '11')
    assert.equal(document.getElementById('outside')!.textContent, '{{ a }}')
  })

  test('throws on a missing template', () => {
    document.body.innerHTML = '<app-container template="nope"></app-container>'
    assert.throws(() => render({}), /missing <template id="nope">/)
  })

  test('throws on a template that includes itself', () => {
    document.body.innerHTML = `
      <app-container template="loop"></app-container>
      <template id="loop"><app-container template="loop"></app-container></template>`
    assert.throws(() => render({}), /include itself/)
  })
})
