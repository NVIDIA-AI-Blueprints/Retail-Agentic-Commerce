/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
// foundations-css import removed
var DropdownPrimitives = require('@radix-ui/react-dropdown-menu');
var useControllableState = require('../../../lib/hooks/use-controllable-state.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');

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

var DropdownPrimitives__namespace = /*#__PURE__*/_interopNamespace(DropdownPrimitives);
var useControllableState__default = /*#__PURE__*/_interopDefault(useControllableState);

const DropdownRoot = ({
  open,
  onOpenChange,
  size,
  defaultOpen = false,
  modal = false,
  children
}) => {
  const [internalOpen, setInternalOpen] = useControllableState__default.default({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange
  });
  return /* @__PURE__ */ jsxRuntime.jsx(context.DropdownContext.Provider, { value: { open: internalOpen, size }, children: /* @__PURE__ */ jsxRuntime.jsx(
    DropdownPrimitives__namespace.DropdownMenu,
    {
      open: internalOpen,
      onOpenChange: setInternalOpen,
      modal,
      "data-testid": constants.DropdownTestIds.DropdownRoot,
      children
    }
  ) });
};
DropdownRoot.displayName = "DropdownRoot";

exports.DropdownRoot = DropdownRoot;
