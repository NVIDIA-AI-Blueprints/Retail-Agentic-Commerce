/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsxs, jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { PopoverContent } from '../composed/PopoverContent.js';
import { PopoverRoot } from '../composed/PopoverRoot.js';
import { PopoverTrigger } from '../composed/PopoverTrigger.js';

const Popover = forwardRef(
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
    return /* @__PURE__ */ jsxs(
      PopoverRoot,
      {
        open,
        onOpenChange,
        defaultOpen,
        modal,
        children: [
          /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, ...attributes?.PopoverTrigger, children }),
          /* @__PURE__ */ jsx(
            PopoverContent,
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

export { Popover };
