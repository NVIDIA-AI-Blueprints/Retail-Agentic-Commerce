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

const verticalNavAccordionItem = cva("nv-vertical-nav-accordion-item");
const VerticalNavAccordionItem = forwardRef(({ className, value, disabled, ...props }, ref) => {
  return /* @__PURE__ */ jsx(RadixAccordion.AccordionItem, { value, asChild: true, children: /* @__PURE__ */ jsx(
    Primitive.div,
    {
      ...mergeProps(
        {
          className: verticalNavAccordionItem({ className }),
          ref,
          "data-testid": VerticalNavTestIds.VerticalNavAccordionItem,
          disabled
        },
        props
      )
    }
  ) });
});
VerticalNavAccordionItem.displayName = "VerticalNavAccordionItem";

export { VerticalNavAccordionItem };
