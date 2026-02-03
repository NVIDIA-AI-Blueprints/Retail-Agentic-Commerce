/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var classVarianceAuthority = require('class-variance-authority');
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const breadcrumbsItem = classVarianceAuthority.cva("nv-breadcrumbs-item", {
  variants: {
    active: {
      true: "nv-breadcrumbs-item--active"
    }
  },
  defaultVariants: {
    active: false
  }
});
const BreadcrumbsItem = React__default.default.forwardRef(({ active = false, className, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    primitive.Primitive.div,
    {
      ...mergeProps.mergeProps(
        { className: breadcrumbsItem({ active, className }), ref },
        props
      )
    }
  );
});
BreadcrumbsItem.displayName = "BreadcrumbsItem";

exports.BreadcrumbsItem = BreadcrumbsItem;
