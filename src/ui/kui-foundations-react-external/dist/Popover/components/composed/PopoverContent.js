/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import * as RadixPopoverPrimitives from '@radix-ui/react-popover';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { PopoverTestIds } from '../../constants.js';

const popoverContent = cva("nv-popover-content");
const PopoverContent = forwardRef(
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
    const Component = asChild ? Slot : "div";
    const content = /* @__PURE__ */ jsx(
      RadixPopoverPrimitives.PopoverContent,
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
        children: /* @__PURE__ */ jsx(
          Component,
          {
            "aria-label": "Popover Content",
            ...mergeProps(
              {
                className: popoverContent({ className }),
                "data-testid": PopoverTestIds.PopoverContent,
                ref
              },
              props
            ),
            children
          }
        )
      }
    );
    return portal ? /* @__PURE__ */ jsx(
      RadixPopoverPrimitives.Portal,
      {
        container: portalContainer,
        forceMount,
        children: content
      }
    ) : content;
  }
);
PopoverContent.displayName = "PopoverContent";

export { PopoverContent };
