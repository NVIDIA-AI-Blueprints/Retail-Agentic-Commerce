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

const skeleton = classVarianceAuthority.cva("nv-skeleton", {
  variants: {
    kind: {
      line: "",
      pill: "nv-skeleton--kind-pill",
      circle: "nv-skeleton--kind-circle"
    },
    animated: {
      true: "nv-skeleton--animated"
    }
  },
  defaultVariants: {
    kind: "line",
    animated: true
  }
});
const Skeleton = react.forwardRef(
  ({ className, animated, kind, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.div,
      {
        ...mergeProps.mergeProps(
          {
            className: skeleton({ className, kind, animated }),
            ref,
            "data-testid": constants.SkeletonTestIds.Skeleton
          },
          props
        )
      }
    );
  }
);
Skeleton.displayName = "Skeleton";

exports.Skeleton = Skeleton;
