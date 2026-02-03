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

const verticalNavSubLink = classVarianceAuthority.cva("nv-vertical-nav-sub-link", {
  variants: {
    active: {
      true: "nv-vertical-nav-sub-link--active"
    },
    disabled: {
      true: "nv-vertical-nav-sub-link--disabled"
    }
  },
  defaultVariants: {
    active: false,
    disabled: false
  },
  compoundVariants: [
    {
      active: true,
      disabled: true,
      className: "nv-vertical-nav-sub-link--disabled"
    }
  ]
});
const VerticalNavSubLink = react.forwardRef(({ className, active, disabled, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    primitive.Primitive.a,
    {
      ...mergeProps.mergeProps(
        {
          className: verticalNavSubLink({ className, active, disabled }),
          ref,
          "data-testid": constants.VerticalNavTestIds.VerticalNavSubLink,
          "aria-disabled": disabled,
          tabIndex: disabled ? -1 : void 0
        },
        props
      )
    }
  );
});
VerticalNavSubLink.displayName = "VerticalNavSubLink";

exports.VerticalNavSubLink = VerticalNavSubLink;
