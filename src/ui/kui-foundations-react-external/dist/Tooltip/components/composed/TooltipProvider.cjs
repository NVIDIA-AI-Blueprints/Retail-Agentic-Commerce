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

const TooltipContext = react.createContext(false);
const TooltipProvider = ({
  openDelayDuration = 100,
  skipDelayDuration = 300,
  children
}) => {
  return /* @__PURE__ */ jsxRuntime.jsx(TooltipContext.Provider, { value: true, children: /* @__PURE__ */ jsxRuntime.jsx(
    Tooltip__namespace.Provider,
    {
      delayDuration: openDelayDuration,
      skipDelayDuration,
      children
    }
  ) });
};

exports.TooltipContext = TooltipContext;
exports.TooltipProvider = TooltipProvider;
