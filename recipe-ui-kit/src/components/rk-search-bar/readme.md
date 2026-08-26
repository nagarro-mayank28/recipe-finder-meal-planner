# rk-search-bar



<!-- Auto Generated Below -->


## Overview

A debounced search input.

Emits `rkSearch` while the user types (debounced) and `rkSearchSubmit` when
they press Enter or the search button, so hosts can choose between
search-as-you-type and explicit submission.

## Properties

| Property      | Attribute     | Description                                                                    | Type      | Default             |
| ------------- | ------------- | ------------------------------------------------------------------------------ | --------- | ------------------- |
| `debounce`    | `debounce`    | Milliseconds to wait after the last keystroke before emitting `rkSearch`.      | `number`  | `350`               |
| `label`       | `label`       | Accessible label for the input.                                                | `string`  | `'Search recipes'`  |
| `loading`     | `loading`     | Renders a spinner in place of the search icon.                                 | `boolean` | `false`             |
| `placeholder` | `placeholder` | Placeholder text for the input.                                                | `string`  | `'Search recipes…'` |
| `value`       | `value`       | Current query. Kept in sync when the host changes it (e.g. clearing a search). | `string`  | `''`                |


## Events

| Event            | Description                                             | Type                  |
| ---------------- | ------------------------------------------------------- | --------------------- |
| `rkSearch`       | Fired after the debounce window with the current query. | `CustomEvent<string>` |
| `rkSearchSubmit` | Fired immediately on Enter or search-button press.      | `CustomEvent<string>` |


## Slots

| Slot        | Description                                                                                |
| ----------- | ------------------------------------------------------------------------------------------ |
| `"filters"` | Rendered next to the input, for filter controls that should sit inside the search surface. |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
