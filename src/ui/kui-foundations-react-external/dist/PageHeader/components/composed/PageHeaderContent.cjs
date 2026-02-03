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

const pageHeaderContent = classVarianceAuthority.cva("nv-page-header-content");
const PageHeaderContent = react.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    primitive.Primitive.div,
    {
      ...mergeProps.mergeProps(
        {
          className: pageHeaderContent({ className }),
          ref,
          "data-testid": constants.PageHeaderTestIds.PageHeaderContent
        },
        props
      )
    }
  );
});
PageHeaderContent.displayName = "PageHeaderContent";

exports.PageHeaderContent = PageHeaderContent;
