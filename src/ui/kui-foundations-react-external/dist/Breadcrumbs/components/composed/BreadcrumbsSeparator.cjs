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
var Icon = require('../../../lib/components/Icon.cjs');
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const breadcrumbsSeparator = classVarianceAuthority.cva("nv-breadcrumbs-separator");
const BreadcrumbsSeparator = React__default.default.forwardRef(({ children = /* @__PURE__ */ jsxRuntime.jsx(Icon.Icon, { name: "chevron-right" }), className, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    primitive.Primitive.div,
    {
      ...mergeProps.mergeProps(
        { className: breadcrumbsSeparator({ className }), ref },
        props
      ),
      children
    }
  );
});
BreadcrumbsSeparator.displayName = "BreadcrumbsSeparator";

exports.BreadcrumbsSeparator = BreadcrumbsSeparator;
