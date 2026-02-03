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
import { densityVariant } from '../../../lib/constants/density.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { DropdownTestIds } from '../../constants.js';

const dropdownContent = cva("nv-dropdown-content", {
  variants: {
    density: densityVariant
  }
});
const DropdownSubContent = forwardRef(
  ({
    className,
    density,
    portal = true,
    portalContainer,
    onEscapeKeyDown,
    onPointerDownOutside,
    forceMount,
    ...props
  }, ref) => {
    const content = /* @__PURE__ */ jsx(
      RadixDropdownPrimitives.DropdownMenuSubContent,
      {
        forceMount,
        onEscapeKeyDown,
        onPointerDownOutside,
        asChild: true,
        children: /* @__PURE__ */ jsx(
          MenuRoot,
          {
            ...mergeProps(
              {
                ref,
                "data-testid": DropdownTestIds.DropdownSubContent,
                className: dropdownContent({ className, density })
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
DropdownSubContent.displayName = "DropdownSubContent";

export { DropdownSubContent };
