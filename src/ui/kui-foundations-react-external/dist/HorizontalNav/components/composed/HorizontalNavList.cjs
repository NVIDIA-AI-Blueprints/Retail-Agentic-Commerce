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

const horizontalNavList = classVarianceAuthority.cva("nv-horizontal-nav-list");
const HorizontalNavList = react.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    Tabs.TabsList,
    {
      ...mergeProps.mergeProps(
        {
          className: horizontalNavList({ className }),
          ref,
          "data-testid": constants.HorizontalNavTestIds.HorizontalNavList,
          kind: "unstyled"
        },
        props
      )
    }
  );
});
HorizontalNavList.displayName = "HorizontalNavList";

exports.HorizontalNavList = HorizontalNavList;
