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

const pageHeaderHeader = classVarianceAuthority.cva("nv-page-header-header");
const PageHeaderHeader = react.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    primitive.Primitive.div,
    {
      ...mergeProps.mergeProps(
        {
          className: pageHeaderHeader({ className }),
          ref,
          "data-testid": constants.PageHeaderTestIds.PageHeaderHeader
        },
        props
      )
    }
  );
});
PageHeaderHeader.displayName = "PageHeaderHeader";

exports.PageHeaderHeader = PageHeaderHeader;
