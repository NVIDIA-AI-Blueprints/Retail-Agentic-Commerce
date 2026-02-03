/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import React from 'react';
import * as RadixLabel from '@radix-ui/react-label';
import { cva } from 'class-variance-authority';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { LabelTestId } from '../../constants.js';

const label = cva("nv-label", {
  variants: {
    disabled: {
      true: "nv-label--disabled"
    },
    size: {
      small: "nv-label--size-small",
      medium: "nv-label--size-standard",
      large: "nv-label--size-large"
    }
  },
  defaultVariants: {
    size: "medium"
  }
});
const Label = React.forwardRef(
  ({ htmlFor, className, disabled, size, ...props }, ref) => {
    return /* @__PURE__ */ jsx(RadixLabel.Root, { htmlFor, asChild: true, children: /* @__PURE__ */ jsx(
      Primitive.label,
      {
        ...mergeProps(
          {
            className: label({ className, disabled, size }),
            "data-testid": LabelTestId.Label,
            ref
          },
          props
        )
      }
    ) });
  }
);
Label.displayName = "Label";

export { Label };
