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

const switchRoot = classVarianceAuthority.cva("nv-switch-root", {
  variants: {
    side: {
      left: "nv-switch-root--side-left",
      right: ""
      // default
    },
    size: {
      small: "nv-switch-root--size-small",
      medium: "",
      large: "nv-switch-root--size-large"
    }
  },
  defaultVariants: {
    side: "right",
    size: "medium"
  }
});
const SwitchRoot = react.forwardRef(
  ({ className, side, size, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.div,
      {
        ...mergeProps.mergeProps(
          {
            className: switchRoot({ className, side, size }),
            ref,
            "data-testid": constants.SwitchTestIds.Root
          },
          props
        )
      }
    );
  }
);
SwitchRoot.displayName = "SwitchRoot";

exports.SwitchRoot = SwitchRoot;
