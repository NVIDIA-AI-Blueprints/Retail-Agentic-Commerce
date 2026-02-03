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
var reactSlot = require('@radix-ui/react-slot');
var classVarianceAuthority = require('class-variance-authority');
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

const popoverContent = classVarianceAuthority.cva("nv-popover-content");
const PopoverContent = react.forwardRef(
  ({
    portal = true,
    portalContainer,
    onCloseAutoFocus,
    onOpenAutoFocus,
    onEscapeKeyDown,
    onPointerDownOutside,
    onInteractOutside,
    align,
    side = "bottom",
    className,
    asChild,
    children,
    forceMount,
    ...props
  }, ref) => {
    const Component = asChild ? reactSlot.Slot : "div";
    const content = /* @__PURE__ */ jsxRuntime.jsx(
      RadixPopoverPrimitives__namespace.PopoverContent,
      {
        forceMount,
        onCloseAutoFocus,
        onOpenAutoFocus,
        onEscapeKeyDown,
        onPointerDownOutside,
        onInteractOutside,
        align,
        side,
        sideOffset: 4,
        asChild: true,
        children: /* @__PURE__ */ jsxRuntime.jsx(
          Component,
          {
            "aria-label": "Popover Content",
            ...mergeProps.mergeProps(
              {
                className: popoverContent({ className }),
                "data-testid": constants.PopoverTestIds.PopoverContent,
                ref
              },
              props
            ),
            children
          }
        )
      }
    );
    return portal ? /* @__PURE__ */ jsxRuntime.jsx(
      RadixPopoverPrimitives__namespace.Portal,
      {
        container: portalContainer,
        forceMount,
        children: content
      }
    ) : content;
  }
);
PopoverContent.displayName = "PopoverContent";

exports.PopoverContent = PopoverContent;
