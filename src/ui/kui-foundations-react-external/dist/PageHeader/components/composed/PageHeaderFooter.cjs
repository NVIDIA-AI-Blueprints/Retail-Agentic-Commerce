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

const pageHeaderFooter = classVarianceAuthority.cva("nv-page-header-footer");
const PageHeaderFooter = react.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    primitive.Primitive.div,
    {
      ...mergeProps.mergeProps(
        {
          className: pageHeaderFooter({ className }),
          ref,
          "data-testid": constants.PageHeaderTestIds.PageHeaderFooter
        },
        props
      )
    }
  );
});
PageHeaderFooter.displayName = "PageHeaderFooter";

exports.PageHeaderFooter = PageHeaderFooter;
