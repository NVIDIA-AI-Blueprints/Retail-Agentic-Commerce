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
var DropdownPrimitives = require('@radix-ui/react-dropdown-menu');
var classVarianceAuthority = require('class-variance-authority');
var AnimatedChevron = require('../../../AnimatedChevron/index.cjs');
var Button = require('../../../Button/index.cjs');
var Slottable = require('../../../lib/components/Slottable.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');

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

var DropdownPrimitives__namespace = /*#__PURE__*/_interopNamespace(DropdownPrimitives);

const dropdownTrigger = classVarianceAuthority.cva("nv-dropdown-trigger");
const DropdownTrigger = react.forwardRef(
  ({
    children,
    color,
    disabled,
    asChild,
    className,
    kind = "tertiary",
    showChevron = true,
    ...props
  }, ref) => {
    const context$1 = context.useDropdownContext();
    return /* @__PURE__ */ jsxRuntime.jsx(
      DropdownPrimitives__namespace.Trigger,
      {
        asChild: true,
        className: dropdownTrigger({ className }),
        "data-testid": constants.DropdownTestIds.DropdownTrigger,
        disabled,
        ref,
        ...props,
        children: /* @__PURE__ */ jsxRuntime.jsx(Button.Button, { asChild, color, kind, size: context$1.size, children: /* @__PURE__ */ jsxRuntime.jsx(Slottable.Slottable, { asChild, child: children, children: (child) => /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
          child,
          showChevron && /* @__PURE__ */ jsxRuntime.jsx(AnimatedChevron.AnimatedChevron, { state: context$1.open ? "open" : "closed" })
        ] }) }) })
      }
    );
  }
);
DropdownTrigger.displayName = "DropdownTrigger";

exports.DropdownTrigger = DropdownTrigger;
