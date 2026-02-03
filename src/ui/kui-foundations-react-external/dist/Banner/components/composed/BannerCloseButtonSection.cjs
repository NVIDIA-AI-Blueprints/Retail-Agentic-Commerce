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

const bannerCloseButtonSection = classVarianceAuthority.cva("nv-banner-close-button-section");
const BannerCloseButtonSection = React__default.default.forwardRef(function BannerCloseButtonSection2({ className, ...props }, ref) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    primitive.Primitive.div,
    {
      ...mergeProps.mergeProps(
        {
          className: bannerCloseButtonSection({ className }),
          "data-testid": constants.BannerTestIds.BannerCloseButtonSection,
          ref
        },
        props
      )
    }
  );
});

exports.BannerCloseButtonSection = BannerCloseButtonSection;
