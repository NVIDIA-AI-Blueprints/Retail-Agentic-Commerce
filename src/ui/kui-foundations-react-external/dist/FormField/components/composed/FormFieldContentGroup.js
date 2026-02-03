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

const formFieldContentGroup = cva("nv-form-field-content-group");
const FormFieldContentGroup = forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    Primitive.div,
    {
      ...mergeProps(
        {
          className: formFieldContentGroup({ className }),
          ref,
          "data-testid": FormFieldTestIds.FormFieldContentGroup
        },
        props
      )
    }
  );
});
FormFieldContentGroup.displayName = "FormFieldContentGroup";

export { FormFieldContentGroup };
