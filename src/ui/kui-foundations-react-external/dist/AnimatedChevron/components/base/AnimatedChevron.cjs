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
var Icon = require('../../../lib/components/Icon.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const animatedChevron = classVarianceAuthority.cva("nv-animated-chevron");
const AnimatedChevron = React__default.default.forwardRef(({ className, state, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    Icon.Icon,
    {
      name: "chevron-down",
      className: animatedChevron({ className }),
      "data-state": state,
      variant: "line",
      ref,
      ...props
    }
  );
});
AnimatedChevron.displayName = "AnimatedChevron";

exports.AnimatedChevron = AnimatedChevron;
