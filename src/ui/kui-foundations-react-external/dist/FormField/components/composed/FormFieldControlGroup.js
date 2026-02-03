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

const formFieldControlGroup = cva("nv-form-field-control-group");
const FormFieldControlGroup = forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    Primitive.div,
    {
      ...mergeProps(
        {
          className: formFieldControlGroup({ className }),
          ref,
          "data-testid": FormFieldTestIds.FormFieldControlGroup
        },
        props
      )
    }
  );
});
FormFieldControlGroup.displayName = "FormFieldControlGroup";

export { FormFieldControlGroup };
