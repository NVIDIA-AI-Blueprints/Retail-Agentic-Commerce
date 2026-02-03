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
var PopoverContent = require('../composed/PopoverContent.cjs');
var PopoverRoot = require('../composed/PopoverRoot.cjs');
var PopoverTrigger = require('../composed/PopoverTrigger.cjs');

const Popover = react.forwardRef(
  ({
    open,
    onOpenChange,
    defaultOpen,
    modal,
    align,
    side,
    onCloseAutoFocus,
    onOpenAutoFocus,
    onEscapeKeyDown,
    onPointerDownOutside,
    onInteractOutside,
    portal,
    portalContainer,
    slotContent,
    forceMount,
    children,
    attributes,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsxs(
      PopoverRoot.PopoverRoot,
      {
        open,
        onOpenChange,
        defaultOpen,
        modal,
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(PopoverTrigger.PopoverTrigger, { asChild: true, ...attributes?.PopoverTrigger, children }),
          /* @__PURE__ */ jsxRuntime.jsx(
            PopoverContent.PopoverContent,
            {
              ref,
              forceMount,
              align,
              side,
              onCloseAutoFocus,
              onOpenAutoFocus,
              onEscapeKeyDown,
              onPointerDownOutside,
              onInteractOutside,
              portal,
              portalContainer,
              ...props,
              children: slotContent
            }
          )
        ]
      }
    );
  }
);
Popover.displayName = "Popover";

exports.Popover = Popover;
