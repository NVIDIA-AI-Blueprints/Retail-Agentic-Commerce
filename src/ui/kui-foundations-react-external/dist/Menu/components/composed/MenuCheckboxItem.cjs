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
var useControllableState = require('../../../lib/hooks/use-controllable-state.cjs');
var constants = require('../../constants.cjs');
var MenuItem = require('./MenuItem.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var useControllableState__default = /*#__PURE__*/_interopDefault(useControllableState);

const menuCheckboxItem = classVarianceAuthority.cva("nv-menu-checkbox-item");
const menuCheckboxBox = classVarianceAuthority.cva("nv-checkbox-box", {
  variants: {
    error: {
      true: "nv-checkbox-box--error"
    }
  }
});
const menuCheckboxIndicator = classVarianceAuthority.cva("nv-checkbox-indicator", {
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
const MenuCheckboxItem = react.forwardRef(
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
    const [internalChecked, setInternalChecked] = useControllableState__default.default({
      value: checked,
      defaultValue: defaultChecked,
      onChange: onCheckedChange
    });
    return /* @__PURE__ */ jsxRuntime.jsx(
      MenuItem.MenuItem,
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
        "data-testid": constants.MenuTestIds.MenuCheckboxItem,
        ...props,
        slotLeft: /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            "aria-disabled": disabled,
            "data-state": checkedStateToAtribute(internalChecked),
            className: menuCheckboxBox({ error: danger }),
            children: /* @__PURE__ */ jsxRuntime.jsx(
              "svg",
              {
                className: menuCheckboxIndicator({ error: danger }),
                xmlns: "http://www.w3.org/2000/svg",
                width: "16",
                height: "16",
                viewBox: "0 0 18 18",
                fill: "none",
                children: internalChecked === "indeterminate" ? /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M4 8L12 8", stroke: "currentColor", strokeWidth: "2" }) : internalChecked ? /* @__PURE__ */ jsxRuntime.jsx(
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

exports.MenuCheckboxItem = MenuCheckboxItem;
