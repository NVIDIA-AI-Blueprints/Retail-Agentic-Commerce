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
var reactToggleGroup = require('@radix-ui/react-toggle-group');
var classVarianceAuthority = require('class-variance-authority');
var Button = require('../../../Button/index.cjs');
var constants = require('../../constants.cjs');

const segmentedControlItem = classVarianceAuthority.cva("nv-segmented-control-item", {
  variants: {
    selected: {
      true: "nv-segmented-control-item--selected",
      false: ""
    }
  }
});
const SegmentedControlItem = react.forwardRef(({ className, selected, children, value, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(reactToggleGroup.Item, { value, asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(
  Button.Button,
  {
    color: "neutral",
    kind: "tertiary",
    ...props,
    className: segmentedControlItem({ className, selected }),
    ref,
    "data-testid": constants.SegmentedControlTestIds.SegmentedControlItem,
    children
  }
) }));
SegmentedControlItem.displayName = reactToggleGroup.Item.displayName;

exports.SegmentedControlItem = SegmentedControlItem;
