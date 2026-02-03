/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import * as RadioGroupPrimitives from '@radix-ui/react-radio-group';
import { cva } from 'class-variance-authority';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { RadioGroupTestIds } from '../../constants.js';

const radioGroupRoot = cva("nv-radio-group-root", {
  variants: {
    error: {
      true: "nv-radio-group-root--error"
    },
    orientation: {
      vertical: "",
      horizontal: "nv-radio-group-root--orientation-horizontal"
    }
  },
  defaultVariants: {
    orientation: "vertical"
  }
});
const RadioGroupRoot = forwardRef(
  ({
    className,
    defaultValue,
    value,
    onValueChange,
    disabled,
    required,
    error,
    name,
    orientation,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsx(
      RadioGroupPrimitives.RadioGroup,
      {
        defaultValue,
        value,
        onValueChange,
        disabled,
        name,
        orientation,
        required,
        asChild: true,
        children: /* @__PURE__ */ jsx(
          Primitive.div,
          {
            ...mergeProps(
              {
                className: radioGroupRoot({ className, error, orientation }),
                ref,
                "data-testid": RadioGroupTestIds.RadioGroupRoot
              },
              props
            )
          }
        )
      }
    );
  }
);
RadioGroupRoot.displayName = "RadioGroupRoot";

export { RadioGroupRoot };
