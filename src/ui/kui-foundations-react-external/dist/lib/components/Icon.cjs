/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
var react = require('react');
var classVarianceAuthority = require('class-variance-authority');
var mergeProps = require('../utils/merge-props.cjs');

const icon = classVarianceAuthority.cva("nv-icon", {
  variants: {
    variant: {
      line: "",
      fill: "nv-icon--fill"
    }
  }
});
const Icon = react.forwardRef(
  ({ className, name, variant = "line", size, state, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      "i",
      {
        ...mergeProps.mergeProps(
          {
            style: {
              "--icon-font-size": size ? `${size}px` : void 0
            },
            className: `${icon({ className, variant })} nv-icon-${name}`,
            ref,
            role: "img",
            "aria-hidden": props["aria-label"] ? "false" : "true",
            "data-state": state
          },
          props
        )
      }
    );
  }
);
Icon.displayName = "Icon";

exports.Icon = Icon;
