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
var classVarianceAuthority = require('class-variance-authority');
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

const dividerElement = classVarianceAuthority.cva("nv-divider-element", {
  variants: {
    orientation: {
      horizontal: "nv-divider-element--orientation-horizontal",
      vertical: "nv-divider-element--orientation-vertical"
    },
    width: {
      small: "",
      medium: "nv-divider-element--width-medium",
      large: "nv-divider-element--width-large"
    }
  },
  defaultVariants: {
    orientation: "horizontal",
    width: "small"
  }
});
const DividerElement = react.forwardRef(
  ({ className, orientation, width, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.div,
      {
        ...mergeProps.mergeProps(
          {
            className: dividerElement({ className, orientation, width }),
            ref,
            "data-testid": constants.DividerTestIds.DividerElement,
            role: "separator",
            "aria-orientation": orientation
          },
          props
        )
      }
    );
  }
);
DividerElement.displayName = "DividerElement";

exports.DividerElement = DividerElement;
