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
var RadixDropdownPrimitives = require('@radix-ui/react-dropdown-menu');
var classVarianceAuthority = require('class-variance-authority');
var Menu = require('../../../Menu/index.cjs');
var Icon = require('../../../lib/components/Icon.cjs');
var children = require('../../../lib/utils/children.cjs');
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

var RadixDropdownPrimitives__namespace = /*#__PURE__*/_interopNamespace(RadixDropdownPrimitives);

const dropdownSubTrigger = classVarianceAuthority.cva("nv-dropdown-sub-trigger");
const DropdownSubTrigger = react.forwardRef(({ disabled, children: children$1, className, filterValue, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    RadixDropdownPrimitives__namespace.SubTrigger,
    {
      textValue: filterValue ?? children.childrenToText(children$1),
      disabled,
      asChild: true,
      children: /* @__PURE__ */ jsxRuntime.jsx(
        Menu.MenuItem,
        {
          disabled,
          ref,
          "data-testid": constants.DropdownTestIds.DropdownSubTrigger,
          className: dropdownSubTrigger({ className }),
          slotRight: /* @__PURE__ */ jsxRuntime.jsx(Icon.Icon, { name: "chevron-right" }),
          ...props,
          children: children$1
        }
      )
    }
  );
});
DropdownSubTrigger.displayName = "DropdownSubTrigger";

exports.DropdownSubTrigger = DropdownSubTrigger;
