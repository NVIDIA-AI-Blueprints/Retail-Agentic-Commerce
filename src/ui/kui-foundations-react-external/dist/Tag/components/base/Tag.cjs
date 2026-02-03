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
var density = require('../../../lib/constants/density.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

const tagRoot = classVarianceAuthority.cva("nv-tag", {
  variants: {
    color: {
      blue: "",
      gray: "nv-tag--color-gray",
      green: "nv-tag--color-green",
      purple: "nv-tag--color-purple",
      red: "nv-tag--color-red",
      teal: "nv-tag--color-teal",
      yellow: "nv-tag--color-yellow"
    },
    density: density.densityVariant,
    kind: {
      outline: "nv-tag--kind-outline",
      solid: ""
    },
    selected: {
      true: "nv-tag--selected"
    }
  },
  defaultVariants: {
    color: "blue",
    kind: "solid"
  }
});
const Tag = react.forwardRef(
  ({ asChild, color, children, density, kind, readOnly, selected, ...props }, ref) => {
    const Component = asChild ? reactSlot.Slot : "button";
    return /* @__PURE__ */ jsxRuntime.jsx(
      Component,
      {
        ...mergeProps.mergeProps(
          {
            className: tagRoot({
              color,
              kind,
              selected,
              density
            }),
            "data-selected": selected,
            "data-testid": constants.TagTestIds.TagRoot,
            readOnly,
            ref
          },
          props
        ),
        children
      }
    );
  }
);
Tag.displayName = "Tag";

exports.Tag = Tag;
