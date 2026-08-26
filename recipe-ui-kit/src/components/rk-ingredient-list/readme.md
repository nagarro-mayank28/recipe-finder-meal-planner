# rk-ingredient-list



<!-- Auto Generated Below -->


## Overview

Checklist of ingredients for the recipe details page.

`items` is an object array, so hosts set it as a **property**. A JSON string
is accepted as well. Ticking a row is local UI state - a shopping aid - so it
deliberately emits nothing.

## Properties

| Property    | Attribute   | Description                                                      | Type                       | Default         |
| ----------- | ----------- | ---------------------------------------------------------------- | -------------------------- | --------------- |
| `checkable` | `checkable` | Renders checkboxes so the list doubles as a shopping list.       | `boolean`                  | `true`          |
| `heading`   | `heading`   | Section heading.                                                 | `string`                   | `'Ingredients'` |
| `items`     | `items`     | Ingredients to render. Accepts an array or a JSON-encoded array. | `RkIngredient[] \| string` | `[]`            |


## Slots

| Slot       | Description                                                       |
| ---------- | ----------------------------------------------------------------- |
| `"header"` | Content shown to the right of the heading, e.g. a servings badge. |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
