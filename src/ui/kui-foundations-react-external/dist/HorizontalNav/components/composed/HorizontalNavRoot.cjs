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
var Tabs = require('../../../Tabs/index.cjs');
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

const horizontalNavRoot = classVarianceAuthority.cva("nv-horizontal-nav-root");
const HorizontalNavRoot = react.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    Tabs.TabsRoot,
    {
      value: props.value,
      defaultValue: props.defaultValue,
      onValueChange: props.onValueChange,
      asChild: true,
      children: /* @__PURE__ */ jsxRuntime.jsx(
        primitive.Primitive.nav,
        {
          ...mergeProps.mergeProps(
            {
              className: horizontalNavRoot({ className }),
              ref,
              "data-testid": constants.HorizontalNavTestIds.HorizontalNavRoot
            },
            props
          )
        }
      )
    }
  );
});
HorizontalNavRoot.displayName = "HorizontalNavRoot";

exports.HorizontalNavRoot = HorizontalNavRoot;
