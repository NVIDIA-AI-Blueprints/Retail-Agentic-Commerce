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
var density = require('../../../lib/constants/density.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
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

var RadixDropdownPrimitives__namespace = /*#__PURE__*/_interopNamespace(RadixDropdownPrimitives);

const dropdownContent = classVarianceAuthority.cva("nv-dropdown-content");
const DropdownContent = react.forwardRef(
  ({
    density: density$1,
    portal = true,
    portalContainer,
    onCloseAutoFocus,
    onEscapeKeyDown,
    onPointerDownOutside,
    onInteractOutside,
    align,
    side = "bottom",
    className,
    forceMount,
    ...props
  }, ref) => {
    const context$1 = context.useDropdownContext();
    const content = /* @__PURE__ */ jsxRuntime.jsx(
      RadixDropdownPrimitives__namespace.DropdownMenuContent,
      {
        forceMount,
        onCloseAutoFocus,
        onEscapeKeyDown,
        onPointerDownOutside,
        onInteractOutside,
        align,
        side,
        sideOffset: 4,
        asChild: true,
        children: /* @__PURE__ */ jsxRuntime.jsx(
          Menu.MenuRoot,
          {
            ...mergeProps.mergeProps(
              {
                density: density$1 ?? density.getDensityFromSize(context$1.size),
                ref,
                "data-testid": constants.DropdownTestIds.DropdownContent,
                className: dropdownContent({ className })
              },
              props
            )
          }
        )
      }
    );
    return portal ? /* @__PURE__ */ jsxRuntime.jsx(
      RadixDropdownPrimitives__namespace.Portal,
      {
        container: portalContainer,
        forceMount,
        children: content
      }
    ) : content;
  }
);
DropdownContent.displayName = "DropdownContent";

exports.DropdownContent = DropdownContent;
