# rk-modal



<!-- Auto Generated Below -->


## Overview

Accessible dialog used for the "assign a recipe" and delete-confirmation flows.

Visibility is fully controlled by the host through `open`; the component only
asks to be closed by emitting `rkClose`.

## Properties

| Property          | Attribute           | Description                                                      | Type      | Default |
| ----------------- | ------------------- | ---------------------------------------------------------------- | --------- | ------- |
| `heading`         | `heading`           | Dialog heading, also used as its accessible name.                | `string`  | `''`    |
| `hideCloseButton` | `hide-close-button` | Hides the × button when the host wants to force a footer choice. | `boolean` | `false` |
| `open`            | `open`              | Whether the dialog is visible.                                   | `boolean` | `false` |


## Events

| Event     | Description                                  | Type                |
| --------- | -------------------------------------------- | ------------------- |
| `rkClose` | Fired on backdrop click, × press, or Escape. | `CustomEvent<void>` |


## Slots

| Slot       | Description                                    |
| ---------- | ---------------------------------------------- |
|            | Dialog body.                                   |
| `"footer"` | Action row pinned to the bottom of the dialog. |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
