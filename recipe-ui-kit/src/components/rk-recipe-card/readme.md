# rk-recipe-card



<!-- Auto Generated Below -->


## Overview

Presentational card for a single recipe.

The card owns no state: the host decides whether it is favourited and reacts
to `rkFavoriteToggle` / `rkOpen`.

## Properties

| Property                | Attribute       | Description                                                         | Type      | Default         |
| ----------------------- | --------------- | ------------------------------------------------------------------- | --------- | --------------- |
| `actionLabel`           | `action-label`  | Text of the primary call-to-action.                                 | `string`  | `'View recipe'` |
| `favorite`              | `favorite`      | Whether the recipe is currently favourited (drives the heart icon). | `boolean` | `false`         |
| `hideFavorite`          | `hide-favorite` | Hides the favourite button entirely, for read-only contexts.        | `boolean` | `false`         |
| `name`                  | `name`          | Recipe title shown as the card heading.                             | `string`  | `''`            |
| `recipeId` _(required)_ | `recipe-id`     | Identifier passed back in every emitted event.                      | `string`  | `undefined`     |
| `thumbnail`             | `thumbnail`     | Thumbnail URL. A placeholder is drawn when omitted.                 | `string`  | `''`            |


## Events

| Event              | Description                                                              | Type                                  |
| ------------------ | ------------------------------------------------------------------------ | ------------------------------------- |
| `rkFavoriteToggle` | Fired when the favourite button is pressed, with the desired next state. | `CustomEvent<RkFavoriteToggleDetail>` |
| `rkOpen`           | Fired when the card or its primary action is activated.                  | `CustomEvent<string>`                 |


## Slots

| Slot        | Description                                                                           |
| ----------- | ------------------------------------------------------------------------------------- |
| `"actions"` | Trailing actions in the footer, e.g. Edit / Delete buttons for recipes the user owns. |
| `"meta"`    | Extra metadata under the title, e.g. `<rk-badge>` chips.                              |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
