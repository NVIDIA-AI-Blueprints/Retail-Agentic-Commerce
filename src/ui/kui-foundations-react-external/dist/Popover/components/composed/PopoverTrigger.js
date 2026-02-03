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
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { PopoverTestIds } from '../../constants.js';

const PopoverTrigger = forwardRef(({ asChild, children, ...props }, ref) => {
  return /* @__PURE__ */ jsx(RadixPopoverPrimitives.Trigger, { asChild: true, children: /* @__PURE__ */ jsx(
    Primitive.button,
    {
      ...mergeProps(
        {
          ref,
          "data-testid": PopoverTestIds.PopoverTrigger,
          asChild: typeof children === "string" ? false : asChild
        },
        props
      ),
      children
    }
  ) });
});
PopoverTrigger.displayName = "PopoverTrigger";

export { PopoverTrigger };
