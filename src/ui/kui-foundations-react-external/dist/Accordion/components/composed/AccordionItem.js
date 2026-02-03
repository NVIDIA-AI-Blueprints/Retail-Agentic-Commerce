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

const accordionItem = cva("nv-accordion-item");
const AccordionItem = React.forwardRef(({ className, value, disabled, ...props }, ref) => {
  return /* @__PURE__ */ jsx(RadixAccordion.AccordionItem, { disabled, value, asChild: true, children: /* @__PURE__ */ jsx(
    Primitive.div,
    {
      ...mergeProps(
        {
          className: accordionItem({ className }),
          "data-testid": AccordionTestIds.AccordionItem,
          ref
        },
        props
      )
    }
  ) });
});
AccordionItem.displayName = "AccordionItem";

export { AccordionItem };
