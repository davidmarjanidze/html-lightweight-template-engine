export type TemplateData = Record<string, string | number>

export interface RenderOptions {
  /** Element or document to render. Defaults to `document`. */
  root?: Element | Document
  /** Prefix of the container tag, e.g. `app` for `<app-container>`. Defaults to `app`. */
  prefix?: string
}

const PLACEHOLDER = /{{\s*([\w.-]+)\s*}}/g
const SKIPPED_TAGS = new Set(['SCRIPT', 'STYLE'])
const MAX_CONTAINERS = 10000

/**
 * Replaces every `{{ key }}` in `text` with `data[key]`.
 * Unknown keys are replaced with the key name.
 */
export function interpolate(text: string, data: TemplateData): string {
  return text.replace(PLACEHOLDER, (_, key: string) =>
    Object.hasOwn(data, key) ? String(data[key]) : key
  )
}

/**
 * Fills `<app-container template="id">` elements with the content of
 * `<template id="id">` and replaces `{{ key }}` placeholders in text and
 * attributes with values from `data`.
 */
export function render(data: TemplateData, options: RenderOptions = {}): void {
  const root = options.root ?? document
  const prefix = options.prefix ?? 'app'

  fillContainers(root, `${prefix}-container`)
  interpolateTree(root, data)
}

function fillContainers(root: Element | Document, tag: string): void {
  const doc = root.ownerDocument ?? (root as Document)
  let container: Element | null
  let count = 0

  while ((container = root.querySelector(tag)) !== null) {
    if (++count > MAX_CONTAINERS) {
      throw new Error(
        `Too many <${tag}> elements. Does a template include itself?`
      )
    }

    const id = container.getAttribute('template') ?? ''
    const template = doc.getElementById(id)
    if (template?.tagName !== 'TEMPLATE') {
      throw new Error(`<${tag}> refers to a missing <template id="${id}">`)
    }

    container.replaceWith(
      (template as HTMLTemplateElement).content.cloneNode(true)
    )
  }
}

function interpolateTree(root: Element | Document, data: TemplateData): void {
  const walker = (root.ownerDocument ?? (root as Document)).createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    (node) =>
      SKIPPED_TAGS.has(node.nodeName)
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT
  )

  for (
    let node: Node | null = walker.currentNode;
    node;
    node = walker.nextNode()
  ) {
    if (node.nodeType === Node.TEXT_NODE) {
      node.nodeValue = interpolate(node.nodeValue ?? '', data)
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      for (const attr of (node as Element).attributes) {
        attr.value = interpolate(attr.value, data)
      }
    }
  }
}
