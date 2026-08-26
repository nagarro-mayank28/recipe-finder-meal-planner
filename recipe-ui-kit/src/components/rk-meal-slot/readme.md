# rk-meal-slot



<!-- Auto Generated Below -->


## Overview

One cell of the weekly planner grid: either an assigned recipe or an empty
"add" target.

## Properties

| Property            | Attribute          | Description                                                    | Type     | Default     |
| ------------------- | ------------------ | -------------------------------------------------------------- | -------- | ----------- |
| `day` _(required)_  | `day`              | Day key echoed back in every event, e.g. `"monday"`.           | `string` | `undefined` |
| `meal` _(required)_ | `meal`             | Meal key echoed back in every event, e.g. `"dinner"`.          | `string` | `undefined` |
| `mealLabel`         | `meal-label`       | Label for the meal, defaults to a title-cased `meal`.          | `string` | `''`        |
| `recipeId`          | `recipe-id`        | Id of the assigned recipe. Empty renders the add-target state. | `string` | `''`        |
| `recipeName`        | `recipe-name`      | Title of the assigned recipe.                                  | `string` | `''`        |
| `recipeThumbnail`   | `recipe-thumbnail` | Thumbnail of the assigned recipe.                              | `string` | `''`        |


## Events

| Event      | Description                                                            | Type                            |
| ---------- | ---------------------------------------------------------------------- | ------------------------------- |
| `rkAssign` | Fired when an empty slot is activated - the host should open a picker. | `CustomEvent<RkMealSlotDetail>` |
| `rkOpen`   | Fired when an assigned recipe is activated - the host should navigate. | `CustomEvent<RkMealSlotDetail>` |
| `rkRemove` | Fired when the remove button on a filled slot is pressed.              | `CustomEvent<RkMealSlotDetail>` |


## Slots

| Slot | Description                                                               |
| ---- | ------------------------------------------------------------------------- |
|      | Extra content shown under an assigned recipe, e.g. a serving-count badge. |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
