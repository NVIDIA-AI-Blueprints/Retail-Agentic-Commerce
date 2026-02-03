/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import * as RadixDropdownPrimitives from '@radix-ui/react-dropdown-menu';
import { cva } from 'class-variance-authority';
import { MenuRoot } from '../../../Menu/index.js';
import { getDensityFromSize } from '../../../lib/constants/density.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { DropdownTestIds } from '../../constants.js';
import { useDropdownContext } from '../../context.js';

const dropdownContent = cva("nv-dropdown-content");
const DropdownContent = forwardRef(
  ({
    density,
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
    const context = useDropdownContext();
    const content = /* @__PURE__ */ jsx(
      RadixDropdownPrimitives.DropdownMenuContent,
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
        children: /* @__PURE__ */ jsx(
          MenuRoot,
          {
            ...mergeProps(
              {
                density: density ?? getDensityFromSize(context.size),
                ref,
                "data-testid": DropdownTestIds.DropdownContent,
                className: dropdownContent({ className })
              },
              props
            )
          }
        )
      }
    );
    return portal ? /* @__PURE__ */ jsx(
      RadixDropdownPrimitives.Portal,
      {
        container: portalContainer,
        forceMount,
        children: content
      }
    ) : content;
  }
);
DropdownContent.displayName = "DropdownContent";

export { DropdownContent };
