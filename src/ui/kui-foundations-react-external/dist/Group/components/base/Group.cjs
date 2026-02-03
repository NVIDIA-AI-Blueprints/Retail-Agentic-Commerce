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

const group = classVarianceAuthority.cva("nv-group", {
  variants: {
    kind: {
      flush: "",
      gap: "nv-group--kind-gap",
      border: "nv-group--kind-border"
    }
  },
  defaultVariants: {
    kind: "flush"
  }
});
const Group = react.forwardRef(
  ({ className, kind, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.div,
      {
        ...mergeProps.mergeProps(
          {
            className: group({ className, kind }),
            "data-testid": constants.GroupTestIds.Group,
            ref
          },
          props
        )
      }
    );
  }
);
Group.displayName = "Group";

exports.Group = Group;
