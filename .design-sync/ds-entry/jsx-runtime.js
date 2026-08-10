// Quartz's components are authored for Preact, which accepts plain HTML
// attribute spellings (`class`, `for`). The claude.ai/design runtime renders
// with React, so this runtime sits in front of react/jsx-runtime and renames
// just those attributes on DOM elements before handing the props to React.
//
// Scope is deliberately the exact set the components actually use — verified by
// grepping quartz/components/**/*.tsx:
//   class= (189)  stroke-linecap= (8)  stroke-width= (7)
//   stroke-linejoin= (7)  for= (2)  datetime= (1)  autocomplete= (1)
// Hyphenated SVG attributes need no mapping: React passes unknown hyphenated
// attributes straight through to the DOM.
import { jsx as rJsx, jsxs as rJsxs, Fragment as rFragment } from "react/jsx-runtime"

const RENAME = {
  class: "className",
  for: "htmlFor",
  datetime: "dateTime",
  autocomplete: "autoComplete",
}

// Preact accepts style as a CSS string; React requires a property object.
function styleToObject(css) {
  const out = {}
  for (const decl of css.split(";")) {
    const i = decl.indexOf(":")
    if (i === -1) continue
    const prop = decl.slice(0, i).trim()
    const value = decl.slice(i + 1).trim()
    if (!prop || !value) continue
    // Custom properties keep their exact name; the rest become camelCase.
    out[prop.startsWith("--") ? prop : prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value
  }
  return out
}

function fix(type, props) {
  // Only DOM elements need this. A component's props are its own API —
  // renaming `class` there would corrupt it.
  if (typeof type !== "string" || props === null || typeof props !== "object") return props
  let out = null
  for (const key in props) {
    const to = RENAME[key]
    if (to === undefined) continue
    if (out === null) out = { ...props }
    // A real React spelling already present wins over the HTML one.
    if (!(to in props)) out[to] = props[key]
    delete out[key]
  }
  if (typeof props.style === "string") {
    if (out === null) out = { ...props }
    out.style = styleToObject(props.style)
  }
  return out === null ? props : out
}

export const Fragment = rFragment
export function jsx(type, props, key) {
  return rJsx(type, fix(type, props), key)
}
export function jsxs(type, props, key) {
  return rJsxs(type, fix(type, props), key)
}
export const jsxDEV = (type, props, key) => rJsx(type, fix(type, props), key)
