/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
// foundations-css import removed
var react = require('react');
var reactPrimitive = require('@radix-ui/react-primitive');
var classVarianceAuthority = require('class-variance-authority');
var Slottable = require('../../../lib/components/Slottable.cjs');
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var MenuSearchProvider = require('./MenuSearchProvider.cjs');

const menuItem = classVarianceAuthority.cva("nv-menu-item", {
  variants: {
    danger: {
      true: "nv-menu-item--danger"
    },
    disabled: {
      true: "nv-menu-item--disabled"
    }
  }
});
const MenuItem = react.forwardRef(
  ({
    className,
    disabled,
    danger,
    onSelect,
    onClick,
    asChild,
    children,
    filterValue,
    slotLeft,
    slotRight,
    ...props
  }, ref) => {
    const innerRef = react.useRef(null);
    react.useImperativeHandle(ref, () => innerRef.current, []);
    const handleSelect = react.useCallback(
      (event) => {
        if (innerRef.current) {
          if (onSelect) {
            innerRef.current.addEventListener("MenuItem.onSelect", onSelect, {
              once: true
            });
          }
          reactPrimitive.dispatchDiscreteCustomEvent(
            innerRef.current,
            new CustomEvent("MenuItem.onSelect", {
              bubbles: true,
              cancelable: true,
              detail: { value: props.value }
            })
          );
        }
        onClick?.(event);
      },
      [onClick, onSelect, props.value]
    );
    if (MenuSearchProvider.useMenuSearchIsMatch(filterValue, props.value, children) === false) {
      return null;
    }
    return /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.li,
      {
        ...mergeProps.mergeProps(
          {
            asChild,
            className: menuItem({ className, disabled, danger }),
            children: children ?? props.value,
            ref: innerRef,
            role: "menuitem",
            "data-disabled": disabled,
            "data-testid": constants.MenuTestIds.MenuItem,
            onClick: handleSelect
          },
          props
        ),
        children: /* @__PURE__ */ jsxRuntime.jsx(Slottable.Slottable, { asChild, child: children, children: (child) => /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
          slotLeft && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "nv-menu-item-slot", children: slotLeft }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "nv-menu-item-label", children: child }),
          slotRight && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "nv-menu-item-slot", children: slotRight })
        ] }) })
      }
    );
  }
);
MenuItem.displayName = "MenuItem";

exports.MenuItem = MenuItem;
