/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import * as RadioGroupPrimitives from '@radix-ui/react-radio-group';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { Slottable } from '../../../lib/components/Slottable.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { RadioGroupTestIds } from '../../constants.js';

const radioGroupItem = cva("nv-radio-group-item", {
  variants: {
    danger: {
      true: "nv-radio-group-item--danger"
    },
    labelSide: {
      left: "nv-radio-group-item--left-side-label",
      right: ""
    }
  }
});
const RadioGroupItem = forwardRef(
  ({
    asChild,
    children,
    className,
    danger,
    disabled,
    labelSide,
    required,
    showIndicator = true,
    value,
    ...props
  }, ref) => {
    const Component = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(
      RadioGroupPrimitives.RadioGroupItem,
      {
        asChild: true,
        disabled,
        required,
        value,
        children: /* @__PURE__ */ jsx(
          Component,
          {
            ...mergeProps(
              {
                className: radioGroupItem({ className, danger, labelSide }),
                ref,
                "data-testid": RadioGroupTestIds.RadioGroupItem
              },
              props
            ),
            children: /* @__PURE__ */ jsx(Slottable, { asChild, child: children, children: (child) => /* @__PURE__ */ jsxs(Fragment, { children: [
              showIndicator && /* @__PURE__ */ jsx(
                "div",
                {
                  className: "nv-radio-group-input",
                  "data-testid": RadioGroupTestIds.RadioGroupInput,
                  children: /* @__PURE__ */ jsx(
                    RadioGroupPrimitives.RadioGroupIndicator,
                    {
                      forceMount: true,
                      className: "nv-radio-group-indicator",
                      "data-testid": RadioGroupTestIds.RadioGroupIndicator
                    }
                  )
                }
              ),
              child
            ] }) })
          }
        )
      }
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroupItem };
