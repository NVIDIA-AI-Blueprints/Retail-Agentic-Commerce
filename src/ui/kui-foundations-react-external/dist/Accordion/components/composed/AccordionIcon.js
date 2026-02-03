/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import React from 'react';
import { cva } from 'class-variance-authority';
import { AnimatedChevron } from '../../../AnimatedChevron/index.js';

const accordionIcon = cva("nv-accordion-icon");
const AccordionIcon = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      AnimatedChevron,
      {
        className: accordionIcon({ className }),
        ref,
        ...props
      }
    );
  }
);
AccordionIcon.displayName = "AccordionIcon";

export { AccordionIcon };
