/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef, useRef, useImperativeHandle, useCallback } from 'react';
import { dispatchDiscreteCustomEvent } from '@radix-ui/react-primitive';
import { cva } from 'class-variance-authority';
import { Slottable } from '../../../lib/components/Slottable.js';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { MenuTestIds } from '../../constants.js';
import { useMenuSearchIsMatch } from './MenuSearchProvider.js';

const menuItem = cva("nv-menu-item", {
  variants: {
    danger: {
      true: "nv-menu-item--danger"
    },
    disabled: {
      true: "nv-menu-item--disabled"
    }
  }
});
const MenuItem = forwardRef(
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
    const innerRef = useRef(null);
    useImperativeHandle(ref, () => innerRef.current, []);
    const handleSelect = useCallback(
      (event) => {
        if (innerRef.current) {
          if (onSelect) {
            innerRef.current.addEventListener("MenuItem.onSelect", onSelect, {
              once: true
            });
          }
          dispatchDiscreteCustomEvent(
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
    if (useMenuSearchIsMatch(filterValue, props.value, children) === false) {
      return null;
    }
    return /* @__PURE__ */ jsx(
      Primitive.li,
      {
        ...mergeProps(
          {
            asChild,
            className: menuItem({ className, disabled, danger }),
            children: children ?? props.value,
            ref: innerRef,
            role: "menuitem",
            "data-disabled": disabled,
            "data-testid": MenuTestIds.MenuItem,
            onClick: handleSelect
          },
          props
        ),
        children: /* @__PURE__ */ jsx(Slottable, { asChild, child: children, children: (child) => /* @__PURE__ */ jsxs(Fragment, { children: [
          slotLeft && /* @__PURE__ */ jsx("div", { className: "nv-menu-item-slot", children: slotLeft }),
          /* @__PURE__ */ jsx("div", { className: "nv-menu-item-label", children: child }),
          slotRight && /* @__PURE__ */ jsx("div", { className: "nv-menu-item-slot", children: slotRight })
        ] }) })
      }
    );
  }
);
MenuItem.displayName = "MenuItem";

export { MenuItem };
