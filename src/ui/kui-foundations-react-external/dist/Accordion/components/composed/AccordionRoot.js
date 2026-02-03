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

const accordionRoot = cva("nv-accordion-root");
const AccordionRoot = React.forwardRef(
  ({
    className,
    collapsible = true,
    defaultValue,
    disabled,
    multiple,
    onValueChange,
    value,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsx(
      RadixAccordion.Root,
      {
        asChild: true,
        collapsible: multiple ? void 0 : collapsible,
        defaultValue,
        disabled,
        onValueChange,
        type: multiple ? "multiple" : "single",
        value,
        children: /* @__PURE__ */ jsx(
          Primitive.div,
          {
            ...mergeProps(
              {
                className: accordionRoot({ className }),
                "data-testid": AccordionTestIds.AccordionRoot,
                ref
              },
              props
            )
          }
        )
      }
    );
  }
);
AccordionRoot.displayName = "AccordionRoot";

export { AccordionRoot };
