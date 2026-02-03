/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
import { forwardRef } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { TooltipTestIds } from '../../constants.js';

const TooltipTrigger = forwardRef(({ asChild, children, ...props }, ref) => {
  return /* @__PURE__ */ jsx(Tooltip.Trigger, { asChild: true, children: /* @__PURE__ */ jsx(
    Primitive.button,
    {
      ...mergeProps(
        {
          "data-testid": TooltipTestIds.Trigger,
          ref,
          asChild: typeof children === "string" ? false : asChild
        },
        props
      ),
      children
    }
  ) });
});
TooltipTrigger.displayName = "TooltipTrigger";

export { TooltipTrigger };
