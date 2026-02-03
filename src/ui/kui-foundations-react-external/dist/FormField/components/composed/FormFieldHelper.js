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

const formFieldHelper = cva("nv-form-field-helper", {
  variants: {
    kind: {
      info: "",
      success: "nv-form-field-helper--kind-success",
      error: "nv-form-field-helper--kind-error"
    }
  },
  defaultVariants: {
    kind: "info"
  }
});
const FormFieldHelper = forwardRef(
  ({ className, kind, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      Primitive.div,
      {
        ...mergeProps(
          {
            className: formFieldHelper({ className, kind }),
            ref,
            "data-testid": FormFieldTestIds.FormFieldHelper,
            role: "status"
          },
          props
        )
      }
    );
  }
);
FormFieldHelper.displayName = "FormFieldHelper";

export { FormFieldHelper };
