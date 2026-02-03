/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
// foundations-css import removed
import { forwardRef, useContext } from 'react';
import { cva } from 'class-variance-authority';
import { MenuTestIds } from '../../constants.js';
import { MenuRadioGroupContext } from '../../context.js';
import { MenuItem } from './MenuItem.js';

const menuRadioGroupItem = cva("nv-menu-radio-group-item nv-radio-group-item", {
  variants: {
    danger: {
      true: "nv-radio-group-item--danger"
    }
  }
});
const MenuRadioGroupItem = forwardRef(
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
    const context = useContext(MenuRadioGroupContext);
    if (!context) {
      throw new Error(
        "MenuRadioGroupItem must be used within a MenuRadioGroup"
      );
    }
    return /* @__PURE__ */ jsx(
      MenuItem,
      {
        onSelect: (e) => {
          context.onValueChange?.(value);
          onSelect?.(e);
        },
        className: menuRadioGroupItem({ className, danger }),
        ref,
        danger,
        disabled,
        filterValue: filterValue ?? (typeof children === "string" ? children : void 0),
        "aria-required": required,
        "aria-checked": context.value === value,
        role: "menuitemradio",
        "data-state": context.value === value ? "checked" : "unchecked",
        "data-testid": MenuTestIds.MenuRadioGroupItem,
        slotLeft: /* @__PURE__ */ jsx(
          "div",
          {
            className: "nv-radio-group-input",
            "data-state": context.value === value ? "checked" : "unchecked",
            children: /* @__PURE__ */ jsx("div", { className: "nv-radio-group-indicator" })
          }
        ),
        ...props,
        children
      }
    );
  }
);
MenuRadioGroupItem.displayName = "MenuRadioGroupItem";

export { MenuRadioGroupItem };
