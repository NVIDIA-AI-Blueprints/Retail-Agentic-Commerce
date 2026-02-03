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

const verticalNavAccordionRoot = cva("nv-vertical-nav-accordion-root", {
  variants: {
    disabled: {
      true: "nv-vertical-nav-accordion-root--disabled"
    }
  },
  defaultVariants: {
    disabled: false
  }
});
const VerticalNavAccordionRoot = forwardRef(
  ({ className, defaultValue, disabled, value, onValueChange, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      RadixAccordion.Root,
      {
        defaultValue,
        value,
        onValueChange,
        type: "multiple",
        disabled,
        asChild: true,
        children: /* @__PURE__ */ jsx(
          Primitive.div,
          {
            ...mergeProps(
              {
                className: verticalNavAccordionRoot({ className, disabled }),
                ref,
                "data-testid": VerticalNavTestIds.VerticalNavAccordionRoot,
                tabIndex: disabled ? -1 : void 0
              },
              props
            )
          }
        )
      }
    );
  }
);
VerticalNavAccordionRoot.displayName = "VerticalNavAccordionRoot";

export { VerticalNavAccordionRoot };
