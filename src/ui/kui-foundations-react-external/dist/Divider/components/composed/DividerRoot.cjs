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

const dividerRoot = classVarianceAuthority.cva("nv-divider-root", {
  variants: {
    orientation: {
      horizontal: "nv-divider-root--orientation-horizontal",
      vertical: "nv-divider-root--orientation-vertical"
    }
  },
  defaultVariants: {
    orientation: "horizontal"
  }
});
const DividerRoot = react.forwardRef(
  ({
    className,
    padding,
    paddingX,
    paddingY,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    spacingX,
    spacingY,
    spacingTop,
    spacingRight,
    spacingBottom,
    spacingLeft,
    orientation,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.div,
      {
        ...mergeProps.mergeProps(
          {
            className: classVarianceAuthority.cx(
              dividerRoot({ className, orientation }),
              primitive.primitive({
                padding,
                paddingX,
                paddingY,
                paddingTop,
                paddingRight,
                paddingBottom,
                paddingLeft,
                spacingX,
                spacingY,
                spacingTop,
                spacingRight,
                spacingBottom,
                spacingLeft
              })
            ),
            ref,
            "data-testid": constants.DividerTestIds.DividerRoot
          },
          props
        )
      }
    );
  }
);
DividerRoot.displayName = "DividerRoot";

exports.DividerRoot = DividerRoot;
