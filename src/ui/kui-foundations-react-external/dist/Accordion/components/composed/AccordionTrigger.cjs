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
var reactSlot = require('@radix-ui/react-slot');
var classVarianceAuthority = require('class-variance-authority');
var Slottable = require('../../../lib/components/Slottable.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var AccordionIcon = require('./AccordionIcon.cjs');

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

const accordionTrigger = classVarianceAuthority.cva("nv-accordion-trigger", {
  variants: {
    iconSide: {
      left: "nv-accordion-trigger--icon-left",
      right: "nv-accordion-trigger--icon-right"
    }
  }
});
const AccordionTrigger = React__default.default.forwardRef(
  ({
    asChild,
    children,
    className,
    disabled,
    iconSide,
    slotIcon = /* @__PURE__ */ jsxRuntime.jsx(AccordionIcon.AccordionIcon, {}),
    ...props
  }, ref) => {
    const Component = asChild ? reactSlot.Slot : "button";
    return /* @__PURE__ */ jsxRuntime.jsx(RadixAccordion__namespace.Trigger, { disabled, asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(
      Component,
      {
        ...mergeProps.mergeProps(
          {
            className: accordionTrigger({ className, iconSide }),
            "data-testid": constants.AccordionTestIds.AccordionTrigger,
            ref
          },
          props
        ),
        children: /* @__PURE__ */ jsxRuntime.jsx(Slottable.Slottable, { asChild, child: children, children: (child) => /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "nv-accordion-label-text", children: child }),
          slotIcon
        ] }) })
      }
    ) });
  }
);
AccordionTrigger.displayName = "AccordionTrigger";

exports.AccordionTrigger = AccordionTrigger;
