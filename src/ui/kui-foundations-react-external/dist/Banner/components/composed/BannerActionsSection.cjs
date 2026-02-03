/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
// foundations-css import removed
var React = require('react');
var classVarianceAuthority = require('class-variance-authority');
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const bannerActionsSection = classVarianceAuthority.cva("nv-banner-actions-section");
const BannerActionsSection = React__default.default.forwardRef(function BannerActionsSection2({ className, ...props }, ref) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    primitive.Primitive.div,
    {
      ...mergeProps.mergeProps(
        {
          className: bannerActionsSection({ className }),
          "data-testid": constants.BannerTestIds.BannerActionsSection,
          ref
        },
        props
      )
    }
  );
});

exports.BannerActionsSection = BannerActionsSection;
