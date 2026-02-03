/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import * as DropdownPrimitives from '@radix-ui/react-dropdown-menu';
import { cva } from 'class-variance-authority';
import { AnimatedChevron } from '../../../AnimatedChevron/index.js';
import { Button } from '../../../Button/index.js';
import { Slottable } from '../../../lib/components/Slottable.js';
import { DropdownTestIds } from '../../constants.js';
import { useDropdownContext } from '../../context.js';

const dropdownTrigger = cva("nv-dropdown-trigger");
const DropdownTrigger = forwardRef(
  ({
    children,
    color,
    disabled,
    asChild,
    className,
    kind = "tertiary",
    showChevron = true,
    ...props
  }, ref) => {
    const context = useDropdownContext();
    return /* @__PURE__ */ jsx(
      DropdownPrimitives.Trigger,
      {
        asChild: true,
        className: dropdownTrigger({ className }),
        "data-testid": DropdownTestIds.DropdownTrigger,
        disabled,
        ref,
        ...props,
        children: /* @__PURE__ */ jsx(Button, { asChild, color, kind, size: context.size, children: /* @__PURE__ */ jsx(Slottable, { asChild, child: children, children: (child) => /* @__PURE__ */ jsxs(Fragment, { children: [
          child,
          showChevron && /* @__PURE__ */ jsx(AnimatedChevron, { state: context.open ? "open" : "closed" })
        ] }) }) })
      }
    );
  }
);
DropdownTrigger.displayName = "DropdownTrigger";

export { DropdownTrigger };
