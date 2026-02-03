/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
var react = require('react');
var TooltipContent = require('../composed/TooltipContent.cjs');
var TooltipProvider = require('../composed/TooltipProvider.cjs');
var TooltipRoot = require('../composed/TooltipRoot.cjs');
var TooltipTrigger = require('../composed/TooltipTrigger.cjs');

const Tooltip = react.forwardRef(
  ({
    slotContent,
    onOpenChange,
    open,
    openDelayDuration,
    defaultOpen,
    onEscapeKeyDown,
    onPointerDownOutside,
    align,
    side,
    portal,
    portalContainer,
    showArrow,
    children,
    attributes,
    ...props
  }, ref) => {
    const isInTooltipProvider = react.useContext(TooltipProvider.TooltipContext);
    const Component = /* @__PURE__ */ jsxRuntime.jsxs(
      TooltipRoot.TooltipRoot,
      {
        open,
        onOpenChange,
        defaultOpen,
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(TooltipTrigger.TooltipTrigger, { asChild: true, ...attributes?.TooltipTrigger, children }),
          /* @__PURE__ */ jsxRuntime.jsx(
            TooltipContent.TooltipContent,
            {
              ref,
              onEscapeKeyDown,
              onPointerDownOutside,
              align,
              side,
              portal,
              portalContainer,
              showArrow,
              ...props,
              children: slotContent
            }
          )
        ]
      }
    );
    return isInTooltipProvider ? Component : /* @__PURE__ */ jsxRuntime.jsx(TooltipProvider.TooltipProvider, { openDelayDuration, children: Component });
  }
);
Tooltip.displayName = "Tooltip";

exports.Tooltip = Tooltip;
