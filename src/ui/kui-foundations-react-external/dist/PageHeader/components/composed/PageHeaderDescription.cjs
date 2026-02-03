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

const pageHeaderDescription = classVarianceAuthority.cva("nv-page-header-description");
const PageHeaderDescription = react.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    primitive.Primitive.div,
    {
      ...mergeProps.mergeProps(
        {
          className: pageHeaderDescription({ className }),
          ref,
          "data-testid": constants.PageHeaderTestIds.PageHeaderDescription
        },
        props
      )
    }
  );
});
PageHeaderDescription.displayName = "PageHeaderDescription";

exports.PageHeaderDescription = PageHeaderDescription;
