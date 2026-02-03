/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
// foundations-css import removed
import React from 'react';
import * as RadixAccordion from '@radix-ui/react-accordion';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { Slottable } from '../../../lib/components/Slottable.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { AccordionTestIds } from '../../constants.js';
import { AccordionIcon } from './AccordionIcon.js';

const accordionTrigger = cva("nv-accordion-trigger", {
  variants: {
    iconSide: {
      left: "nv-accordion-trigger--icon-left",
      right: "nv-accordion-trigger--icon-right"
    }
  }
});
const AccordionTrigger = React.forwardRef(
  ({
    asChild,
    children,
    className,
    disabled,
    iconSide,
    slotIcon = /* @__PURE__ */ jsx(AccordionIcon, {}),
    ...props
  }, ref) => {
    const Component = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(RadixAccordion.Trigger, { disabled, asChild: true, children: /* @__PURE__ */ jsx(
      Component,
      {
        ...mergeProps(
          {
            className: accordionTrigger({ className, iconSide }),
            "data-testid": AccordionTestIds.AccordionTrigger,
            ref
          },
          props
        ),
        children: /* @__PURE__ */ jsx(Slottable, { asChild, child: children, children: (child) => /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("span", { className: "nv-accordion-label-text", children: child }),
          slotIcon
        ] }) })
      }
    ) });
  }
);
AccordionTrigger.displayName = "AccordionTrigger";

export { AccordionTrigger };
