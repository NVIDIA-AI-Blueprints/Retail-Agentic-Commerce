/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { FormFieldTestIds } from '../../constants.js';

const formFieldRoot = cva("nv-form-field-root", {
  variants: {
    labelPosition: {
      left: "nv-form-field-root--label-position-left",
      top: ""
    },
    required: {
      true: "nv-form-field-root--required"
    }
  },
  defaultVariants: {
    labelPosition: "top"
  }
});
const FormFieldRoot = forwardRef(
  ({ className, labelPosition = "top", required, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      Primitive.div,
      {
        ...mergeProps(
          {
            className: formFieldRoot({ className, labelPosition, required }),
            ref,
            "data-testid": FormFieldTestIds.FormFieldRoot
          },
          props
        )
      }
    );
  }
);
FormFieldRoot.displayName = "FormFieldRoot";

export { FormFieldRoot };
