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
var useControllableState = require('../../../lib/hooks/use-controllable-state.cjs');
var SegmentedControlItem = require('../composed/SegmentedControlItem.cjs');
var SegmentedControlRoot = require('../composed/SegmentedControlRoot.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var useControllableState__default = /*#__PURE__*/_interopDefault(useControllableState);

const SegmentedControl = react.forwardRef(
  ({ items, defaultValue, value, onValueChange, size, className, style }, ref) => {
    const [internalValue, setInternalValue] = useControllableState__default.default({
      defaultValue: defaultValue || (typeof items[0] === "string" ? items[0] : items[0].value),
      value,
      onChange: onValueChange
    });
    return /* @__PURE__ */ jsxRuntime.jsx(
      SegmentedControlRoot.SegmentedControlRoot,
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
          return /* @__PURE__ */ jsxRuntime.jsx(
            SegmentedControlItem.SegmentedControlItem,
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

exports.SegmentedControl = SegmentedControl;
