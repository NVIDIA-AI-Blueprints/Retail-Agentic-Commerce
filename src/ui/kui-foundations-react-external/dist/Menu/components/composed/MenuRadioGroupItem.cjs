/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
// foundations-css import removed
// foundations-css import removed
var react = require('react');
var classVarianceAuthority = require('class-variance-authority');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');
var MenuItem = require('./MenuItem.cjs');

const menuRadioGroupItem = classVarianceAuthority.cva("nv-menu-radio-group-item nv-radio-group-item", {
  variants: {
    danger: {
      true: "nv-radio-group-item--danger"
    }
  }
});
const MenuRadioGroupItem = react.forwardRef(
  ({
    className,
    children,
    danger,
    value,
    disabled,
    required,
    onSelect,
    filterValue,
    ...props
  }, ref) => {
    const context$1 = react.useContext(context.MenuRadioGroupContext);
    if (!context$1) {
      throw new Error(
        "MenuRadioGroupItem must be used within a MenuRadioGroup"
      );
    }
    return /* @__PURE__ */ jsxRuntime.jsx(
      MenuItem.MenuItem,
      {
        onSelect: (e) => {
          context$1.onValueChange?.(value);
          onSelect?.(e);
        },
        className: menuRadioGroupItem({ className, danger }),
        ref,
        danger,
        disabled,
        filterValue: filterValue ?? (typeof children === "string" ? children : void 0),
        "aria-required": required,
        "aria-checked": context$1.value === value,
        role: "menuitemradio",
        "data-state": context$1.value === value ? "checked" : "unchecked",
        "data-testid": constants.MenuTestIds.MenuRadioGroupItem,
        slotLeft: /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            className: "nv-radio-group-input",
            "data-state": context$1.value === value ? "checked" : "unchecked",
            children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "nv-radio-group-indicator" })
          }
        ),
        ...props,
        children
      }
    );
  }
);
MenuRadioGroupItem.displayName = "MenuRadioGroupItem";

exports.MenuRadioGroupItem = MenuRadioGroupItem;
