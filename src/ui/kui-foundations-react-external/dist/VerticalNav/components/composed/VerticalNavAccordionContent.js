/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import * as RadixAccordion from '@radix-ui/react-accordion';
import { cva } from 'class-variance-authority';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { VerticalNavTestIds } from '../../constants.js';

const verticalNavAccordionContent = cva("nv-vertical-nav-accordion-content");
const VerticalNavAccordionContent = forwardRef(({ className, disabled, ...props }, ref) => {
  return /* @__PURE__ */ jsx(RadixAccordion.AccordionContent, { asChild: true, forceMount: true, children: /* @__PURE__ */ jsx(
    Primitive.div,
    {
      ...mergeProps(
        {
          className: verticalNavAccordionContent({ className }),
          ref,
          "data-testid": VerticalNavTestIds.VerticalNavAccordionContent,
          disabled,
          tabIndex: disabled ? -1 : void 0
        },
        props
      )
    }
  ) });
});
VerticalNavAccordionContent.displayName = "VerticalNavAccordionContent";

export { VerticalNavAccordionContent };
