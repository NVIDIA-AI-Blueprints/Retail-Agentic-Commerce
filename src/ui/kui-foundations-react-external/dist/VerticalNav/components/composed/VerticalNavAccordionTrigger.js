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
import { VerticalNavTestIds } from '../../constants.js';

const verticalNavAccordionTrigger = cva([
  "nv-vertical-nav-accordion-trigger",
  "nv-vertical-nav-link"
]);
const VerticalNavAccordionTrigger = forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(RadixAccordion.AccordionTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
    "button",
    {
      className: verticalNavAccordionTrigger({ className }),
      ref,
      "data-active-state": "disabled",
      "data-testid": VerticalNavTestIds.VerticalNavAccordionTrigger,
      ...props
    }
  ) });
});
VerticalNavAccordionTrigger.displayName = "VerticalNavAccordionTrigger";

export { VerticalNavAccordionTrigger };
