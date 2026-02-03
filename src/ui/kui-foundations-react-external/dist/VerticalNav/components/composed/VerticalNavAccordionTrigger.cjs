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
var RadixAccordion = require('@radix-ui/react-accordion');
var classVarianceAuthority = require('class-variance-authority');
var constants = require('../../constants.cjs');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var RadixAccordion__namespace = /*#__PURE__*/_interopNamespace(RadixAccordion);

const verticalNavAccordionTrigger = classVarianceAuthority.cva([
  "nv-vertical-nav-accordion-trigger",
  "nv-vertical-nav-link"
]);
const VerticalNavAccordionTrigger = react.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx(RadixAccordion__namespace.AccordionTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(
    "button",
    {
      className: verticalNavAccordionTrigger({ className }),
      ref,
      "data-active-state": "disabled",
      "data-testid": constants.VerticalNavTestIds.VerticalNavAccordionTrigger,
      ...props
    }
  ) });
});
VerticalNavAccordionTrigger.displayName = "VerticalNavAccordionTrigger";

exports.VerticalNavAccordionTrigger = VerticalNavAccordionTrigger;
