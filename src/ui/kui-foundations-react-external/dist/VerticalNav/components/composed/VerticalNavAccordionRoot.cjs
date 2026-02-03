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
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
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

const verticalNavAccordionRoot = classVarianceAuthority.cva("nv-vertical-nav-accordion-root", {
  variants: {
    disabled: {
      true: "nv-vertical-nav-accordion-root--disabled"
    }
  },
  defaultVariants: {
    disabled: false
  }
});
const VerticalNavAccordionRoot = react.forwardRef(
  ({ className, defaultValue, disabled, value, onValueChange, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      RadixAccordion__namespace.Root,
      {
        defaultValue,
        value,
        onValueChange,
        type: "multiple",
        disabled,
        asChild: true,
        children: /* @__PURE__ */ jsxRuntime.jsx(
          primitive.Primitive.div,
          {
            ...mergeProps.mergeProps(
              {
                className: verticalNavAccordionRoot({ className, disabled }),
                ref,
                "data-testid": constants.VerticalNavTestIds.VerticalNavAccordionRoot,
                tabIndex: disabled ? -1 : void 0
              },
              props
            )
          }
        )
      }
    );
  }
);
VerticalNavAccordionRoot.displayName = "VerticalNavAccordionRoot";

exports.VerticalNavAccordionRoot = VerticalNavAccordionRoot;
