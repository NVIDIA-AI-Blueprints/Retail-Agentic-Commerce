/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import React, { forwardRef, useRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { densityVariant } from '../../../lib/constants/density.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { mergeRefs } from '../../../lib/utils/merge-refs.js';
import { MenuTestIds } from '../../constants.js';

const menuRoot = cva("nv-menu", {
  variants: {
    density: densityVariant
  }
});
const MenuRoot = forwardRef(
  ({ className, density, asChild, onScrollToBottom, ...props }, ref) => {
    const Element = asChild ? Slot : "menu";
    const innerRef = useRef(null);
    React.useEffect(() => {
      const menuRef = innerRef?.current;
      if (!menuRef) return;
      const onScroll = () => {
        if (menuRef.scrollTop + menuRef.offsetHeight >= menuRef.scrollHeight) {
          onScrollToBottom?.();
        }
      };
      menuRef.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        menuRef.removeEventListener("scroll", onScroll);
      };
    }, [onScrollToBottom]);
    return /* @__PURE__ */ jsx(
      Element,
      {
        ...mergeProps(
          {
            className: menuRoot({ className, density }),
            ref: mergeRefs(ref, innerRef),
            "data-testid": MenuTestIds.MenuRoot,
            role: "menu"
          },
          props
        )
      }
    );
  }
);
MenuRoot.displayName = "MenuRoot";

export { MenuRoot };
