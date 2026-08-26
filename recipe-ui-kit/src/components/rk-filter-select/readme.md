# rk-filter-select



<!-- Auto Generated Below -->


## Overview

Labelled dropdown used to narrow a recipe list.

`options` is an object array, so hosts must set it as a **property** rather
than an attribute. A JSON string is also accepted as a convenience for
server-rendered markup.

## Properties

| Property            | Attribute     | Description                                                               | Type                         | Default     |
| ------------------- | ------------- | ------------------------------------------------------------------------- | ---------------------------- | ----------- |
| `disabled`          | `disabled`    | Disables the control, e.g. while its choices are still loading.           | `boolean`                    | `false`     |
| `label`             | `label`       | Visible label above the control.                                          | `string`                     | `''`        |
| `name` _(required)_ | `name`        | Echoed back in `rkFilterChange` so one handler can serve several filters. | `string`                     | `undefined` |
| `options`           | `options`     | Choices to render. Accepts an array or a JSON-encoded array.              | `RkFilterOption[] \| string` | `[]`        |
| `placeholder`       | `placeholder` | Label for the "no filter" entry.                                          | `string`                     | `'All'`     |
| `value`             | `value`       | Currently selected option value. Empty string selects the reset entry.    | `string`                     | `''`        |


## Events

| Event            | Description                                       | Type                                |
| ---------------- | ------------------------------------------------- | ----------------------------------- |
| `rkFilterChange` | Fired whenever the user picks a different option. | `CustomEvent<RkFilterChangeDetail>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
