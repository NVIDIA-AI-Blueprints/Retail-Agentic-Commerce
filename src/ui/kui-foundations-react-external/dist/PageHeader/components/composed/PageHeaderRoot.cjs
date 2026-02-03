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
var density = require('../../../lib/constants/density.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

const pageHeaderRoot = classVarianceAuthority.cva("nv-page-header-root", {
  variants: {
    density: density.densityVariant,
    kind: {
      floating: "nv-page-header-root--kind-floating",
      flat: ""
    }
  },
  defaultVariants: {
    kind: "flat"
  }
});
const PageHeaderRoot = react.forwardRef(
  ({ className, kind, density, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "nv-inline-container", children: /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.div,
      {
        ...mergeProps.mergeProps(
          {
            className: pageHeaderRoot({ className, kind, density }),
            ref,
            "data-testid": constants.PageHeaderTestIds.PageHeaderRoot
          },
          props
        )
      }
    ) });
  }
);
PageHeaderRoot.displayName = "PageHeaderRoot";

exports.PageHeaderRoot = PageHeaderRoot;
