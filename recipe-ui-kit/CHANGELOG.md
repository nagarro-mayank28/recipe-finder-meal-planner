# Changelog

This package follows [semantic versioning](https://semver.org): patch for fixes
that leave the component API untouched, minor for additive props, events or
slots, major for anything a consumer would have to rewrite.

## 1.0.1

### Fixed

- **`rk-meal-slot`** — a filled slot rendered 21px wider than an empty one, so a
  planned meal overflowed its grid cell and overlapped the next column. The empty
  state is a `<button>` (`box-sizing: border-box` by default) while the filled
  state is a `<div>` (`content-box`), so `width: 100%` plus padding and a border
  resolved to different widths. `box-sizing` is now set explicitly.

No API change: props, events and slots are identical to 1.0.0.

## 1.0.0

Initial release. Eight shadow-DOM components — `rk-search-bar`,
`rk-filter-select`, `rk-recipe-card`, `rk-ingredient-list`, `rk-meal-slot`,
`rk-modal`, `rk-empty-state`, `rk-badge` — themable through `--rk-*` custom
properties, with generated TypeScript declarations.
