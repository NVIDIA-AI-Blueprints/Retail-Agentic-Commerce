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
var RadixAccordion = require('@radix-ui/react-accordion');
var classVarianceAuthority = require('class-variance-authority');
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

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

var React__default = /*#__PURE__*/_interopDefault(React);
var RadixAccordion__namespace = /*#__PURE__*/_interopNamespace(RadixAccordion);

const accordionContent = classVarianceAuthority.cva("nv-accordion-content");
const AccordionContent = React__default.default.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx(RadixAccordion__namespace.Content, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(
    primitive.Primitive.div,
    {
      ...mergeProps.mergeProps(
        {
          className: accordionContent({ className }),
          "data-testid": constants.AccordionTestIds.AccordionContent,
          ref
        },
        props
      )
    }
  ) });
});
AccordionContent.displayName = "AccordionContent";

exports.AccordionContent = AccordionContent;
