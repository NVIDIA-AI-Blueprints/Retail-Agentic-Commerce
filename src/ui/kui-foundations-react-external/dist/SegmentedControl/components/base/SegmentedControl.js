/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import useControllableState from '../../../lib/hooks/use-controllable-state.js';
import { SegmentedControlItem } from '../composed/SegmentedControlItem.js';
import { SegmentedControlRoot } from '../composed/SegmentedControlRoot.js';

const SegmentedControl = forwardRef(
  ({ items, defaultValue, value, onValueChange, size, className, style }, ref) => {
    const [internalValue, setInternalValue] = useControllableState({
      defaultValue: defaultValue || (typeof items[0] === "string" ? items[0] : items[0].value),
      value,
      onChange: onValueChange
    });
    return /* @__PURE__ */ jsx(
      SegmentedControlRoot,
      {
        style,
        ref,
        className,
        size,
        onValueChange: (val) => {
          if (val) {
            setInternalValue(val);
          }
        },
        value: internalValue,
        children: items.map((option) => {
          const val = typeof option === "string" ? option : option.value;
          const children = typeof option === "string" ? option : option.children;
          return /* @__PURE__ */ jsx(
            SegmentedControlItem,
            {
              value: val,
              selected: internalValue === val,
              children
            },
            val
          );
        })
      }
    );
  }
);
SegmentedControl.displayName = "SegmentedControl";

export { SegmentedControl };
