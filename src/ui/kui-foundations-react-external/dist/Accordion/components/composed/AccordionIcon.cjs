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
var AnimatedChevron = require('../../../AnimatedChevron/index.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const accordionIcon = classVarianceAuthority.cva("nv-accordion-icon");
const AccordionIcon = React__default.default.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      AnimatedChevron.AnimatedChevron,
      {
        className: accordionIcon({ className }),
        ref,
        ...props
      }
    );
  }
);
AccordionIcon.displayName = "AccordionIcon";

exports.AccordionIcon = AccordionIcon;
