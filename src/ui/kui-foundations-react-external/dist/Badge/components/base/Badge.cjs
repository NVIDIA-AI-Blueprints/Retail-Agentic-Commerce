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
var reactSlot = require('@radix-ui/react-slot');
var classVarianceAuthority = require('class-variance-authority');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

const badge = classVarianceAuthority.cva("nv-badge", {
  variants: {
    kind: {
      outline: "",
      solid: "nv-badge--kind-solid"
    },
    color: {
      blue: "",
      green: "nv-badge--color-green",
      red: "nv-badge--color-red",
      yellow: "nv-badge--color-yellow",
      purple: "nv-badge--color-purple",
      teal: "nv-badge--color-teal",
      gray: "nv-badge--color-gray"
    }
  },
  defaultVariants: {
    kind: "outline",
    color: "blue"
  }
});
const Badge = react.forwardRef(
  ({ asChild, className, children, color, kind, type, ...props }, ref) => {
    const Component = asChild ? reactSlot.Slot : "span";
    return /* @__PURE__ */ jsxRuntime.jsx(
      Component,
      {
        ...mergeProps.mergeProps(
          {
            className: badge({
              className,
              kind: kind || (type === "bold" ? "solid" : type),
              color
            }),
            ref,
            "data-testid": constants.BadgeTestIds.BadgeRoot
          },
          props
        ),
        children
      }
    );
  }
);
Badge.displayName = "Badge";

exports.Badge = Badge;
