/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsxs, jsx } from 'react/jsx-runtime';
import { forwardRef, useContext } from 'react';
import { TooltipContent } from '../composed/TooltipContent.js';
import { TooltipContext, TooltipProvider } from '../composed/TooltipProvider.js';
import { TooltipRoot } from '../composed/TooltipRoot.js';
import { TooltipTrigger } from '../composed/TooltipTrigger.js';

const Tooltip = forwardRef(
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
    const isInTooltipProvider = useContext(TooltipContext);
    const Component = /* @__PURE__ */ jsxs(
      TooltipRoot,
      {
        open,
        onOpenChange,
        defaultOpen,
        children: [
          /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, ...attributes?.TooltipTrigger, children }),
          /* @__PURE__ */ jsx(
            TooltipContent,
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
    return isInTooltipProvider ? Component : /* @__PURE__ */ jsx(TooltipProvider, { openDelayDuration, children: Component });
  }
);
Tooltip.displayName = "Tooltip";

export { Tooltip };
