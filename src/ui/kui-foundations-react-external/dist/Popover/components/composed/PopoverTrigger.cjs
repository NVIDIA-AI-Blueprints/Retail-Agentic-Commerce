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
var RadixPopoverPrimitives = require('@radix-ui/react-popover');
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

var RadixPopoverPrimitives__namespace = /*#__PURE__*/_interopNamespace(RadixPopoverPrimitives);

const PopoverTrigger = react.forwardRef(({ asChild, children, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx(RadixPopoverPrimitives__namespace.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(
    primitive.Primitive.button,
    {
      ...mergeProps.mergeProps(
        {
          ref,
          "data-testid": constants.PopoverTestIds.PopoverTrigger,
          asChild: typeof children === "string" ? false : asChild
        },
        props
      ),
      children
    }
  ) });
});
PopoverTrigger.displayName = "PopoverTrigger";

exports.PopoverTrigger = PopoverTrigger;
