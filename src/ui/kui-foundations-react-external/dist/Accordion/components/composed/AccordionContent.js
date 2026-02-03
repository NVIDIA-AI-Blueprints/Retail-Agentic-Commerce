/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import React from 'react';
import * as RadixAccordion from '@radix-ui/react-accordion';
import { cva } from 'class-variance-authority';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { AccordionTestIds } from '../../constants.js';

const accordionContent = cva("nv-accordion-content");
const AccordionContent = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(RadixAccordion.Content, { asChild: true, children: /* @__PURE__ */ jsx(
    Primitive.div,
    {
      ...mergeProps(
        {
          className: accordionContent({ className }),
          "data-testid": AccordionTestIds.AccordionContent,
          ref
        },
        props
      )
    }
  ) });
});
AccordionContent.displayName = "AccordionContent";

export { AccordionContent };
