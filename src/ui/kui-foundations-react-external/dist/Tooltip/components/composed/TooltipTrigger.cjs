/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
var react = require('react');
var Tooltip = require('@radix-ui/react-tooltip');
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

var Tooltip__namespace = /*#__PURE__*/_interopNamespace(Tooltip);

const TooltipTrigger = react.forwardRef(({ asChild, children, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx(Tooltip__namespace.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(
    primitive.Primitive.button,
    {
      ...mergeProps.mergeProps(
        {
          "data-testid": constants.TooltipTestIds.Trigger,
          ref,
          asChild: typeof children === "string" ? false : asChild
        },
        props
      ),
      children
    }
  ) });
});
TooltipTrigger.displayName = "TooltipTrigger";

exports.TooltipTrigger = TooltipTrigger;
