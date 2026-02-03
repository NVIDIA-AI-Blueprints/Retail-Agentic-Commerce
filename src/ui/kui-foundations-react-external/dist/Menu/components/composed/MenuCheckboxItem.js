/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
// foundations-css import removed
import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import useControllableState from '../../../lib/hooks/use-controllable-state.js';
import { MenuTestIds } from '../../constants.js';
import { MenuItem } from './MenuItem.js';

const menuCheckboxItem = cva("nv-menu-checkbox-item");
const menuCheckboxBox = cva("nv-checkbox-box", {
  variants: {
    error: {
      true: "nv-checkbox-box--error"
    }
  }
});
const menuCheckboxIndicator = cva("nv-checkbox-indicator", {
  variants: {
    error: {
      true: "nv-checkbox-indicator--error"
    }
  }
});
const checkedStateToAtribute = (checked) => {
  if (checked === true) {
    return "checked";
  }
  if (checked === false) {
    return "unchecked";
  }
  return checked;
};
const MenuCheckboxItem = forwardRef(
  ({
    disabled,
    onSelect,
    className,
    children,
    checked,
    defaultChecked,
    onCheckedChange,
    danger,
    filterValue,
    ...props
  }, ref) => {
    const [internalChecked, setInternalChecked] = useControllableState({
      value: checked,
      defaultValue: defaultChecked,
      onChange: onCheckedChange
    });
    return /* @__PURE__ */ jsx(
      MenuItem,
      {
        "aria-checked": internalChecked === "indeterminate" ? "mixed" : !!internalChecked,
        ref,
        disabled,
        danger,
        filterValue: filterValue ?? (typeof children === "string" ? children : void 0),
        onSelect: (e) => {
          setInternalChecked(
            internalChecked === "indeterminate" ? true : !internalChecked
          );
          onSelect?.(e);
        },
        className: menuCheckboxItem({ className }),
        role: "menuitemcheckbox",
        "data-state": checkedStateToAtribute(internalChecked),
        "data-testid": MenuTestIds.MenuCheckboxItem,
        ...props,
        slotLeft: /* @__PURE__ */ jsx(
          "div",
          {
            "aria-disabled": disabled,
            "data-state": checkedStateToAtribute(internalChecked),
            className: menuCheckboxBox({ error: danger }),
            children: /* @__PURE__ */ jsx(
              "svg",
              {
                className: menuCheckboxIndicator({ error: danger }),
                xmlns: "http://www.w3.org/2000/svg",
                width: "16",
                height: "16",
                viewBox: "0 0 18 18",
                fill: "none",
                children: internalChecked === "indeterminate" ? /* @__PURE__ */ jsx("path", { d: "M4 8L12 8", stroke: "currentColor", strokeWidth: "2" }) : internalChecked ? /* @__PURE__ */ jsx(
                  "path",
                  {
                    d: "M3 8L6.18198 11.182L13.253 4.11091",
                    stroke: "currentColor",
                    strokeWidth: "2"
                  }
                ) : null
              }
            )
          }
        ),
        children
      }
    );
  }
);
MenuCheckboxItem.displayName = "MenuCheckboxItem";

export { MenuCheckboxItem };
