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
var primitive = require('../../../lib/components/primitive.cjs');
var constants = require('../../constants.cjs');

const segmentedControlRoot = classVarianceAuthority.cva(
  "nv-segmented-control-root nv-button-group nv-button-group--kind-tertiary",
  {
    variants: {
      size: {
        tiny: "nv-button-group--size-tiny",
        small: "nv-button-group--size-small",
        medium: "nv-button-group--size-medium",
        large: "nv-button-group--size-large"
      }
    }
  }
);
const SegmentedControlRoot = react.forwardRef(({ className, onValueChange, value, size, defaultValue, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(
  reactToggleGroup.Root,
  {
    onValueChange,
    value,
    defaultValue,
    asChild: true,
    type: "single",
    children: /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.div,
      {
        className: segmentedControlRoot({ className, size }),
        "data-testid": constants.SegmentedControlTestIds.SegmentedControlRoot,
        ref,
        ...props
      }
    )
  }
));
SegmentedControlRoot.displayName = reactToggleGroup.Root.displayName;

exports.SegmentedControlRoot = SegmentedControlRoot;
