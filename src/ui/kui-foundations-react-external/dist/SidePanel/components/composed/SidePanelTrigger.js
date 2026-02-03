/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { SidePanelTestIds } from '../../constants.js';

const SidePanelTrigger = forwardRef(({ className, children, asChild, ...props }, ref) => {
  return /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
    Primitive.button,
    {
      ...mergeProps(
        {
          className,
          ref,
          "data-testid": SidePanelTestIds.SidePanelTrigger,
          asChild: typeof children === "string" ? false : asChild
        },
        props
      ),
      children
    }
  ) });
});
SidePanelTrigger.displayName = "SidePanelTrigger";

export { SidePanelTrigger };
