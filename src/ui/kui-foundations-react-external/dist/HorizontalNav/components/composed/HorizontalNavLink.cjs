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
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

const horizontalNavLink = classVarianceAuthority.cva("nv-horizontal-nav-link");
const HorizontalNavLink = react.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    Tabs.TabsTrigger,
    {
      ...mergeProps.mergeProps(
        {
          className: horizontalNavLink({ className }),
          "data-testid": constants.HorizontalNavTestIds.HorizontalNavLink,
          ref
        },
        props
      ),
      asChild: true
    }
  );
});
HorizontalNavLink.displayName = "HorizontalNavLink";

exports.HorizontalNavLink = HorizontalNavLink;
