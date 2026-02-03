/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
// foundations-css import removed
var RadixPopoverPrimitives = require('@radix-ui/react-popover');
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

const PopoverRoot = ({
  defaultOpen,
  open,
  onOpenChange,
  modal = false,
  children
}) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    RadixPopoverPrimitives__namespace.Root,
    {
      defaultOpen,
      open,
      onOpenChange,
      modal,
      "data-testid": constants.PopoverTestIds.PopoverRoot,
      children
    }
  );
};

exports.PopoverRoot = PopoverRoot;
