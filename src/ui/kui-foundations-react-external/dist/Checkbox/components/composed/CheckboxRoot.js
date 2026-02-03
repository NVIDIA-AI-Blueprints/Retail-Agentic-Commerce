/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import React from 'react';
import { cva } from 'class-variance-authority';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { CheckboxTestIds } from '../../constants.js';

const checkboxRoot = cva("nv-checkbox-root", {
  variants: {
    labelSide: {
      left: "nv-checkbox-root--label-left",
      right: ""
    }
  }
});
const CheckboxRoot = React.forwardRef(
  ({ className, labelSide, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      Primitive.div,
      {
        ...mergeProps(
          {
            className: checkboxRoot({ className, labelSide }),
            "data-testid": CheckboxTestIds.Root,
            ref
          },
          props
        )
      }
    );
  }
);
CheckboxRoot.displayName = "CheckboxRoot";

export { CheckboxRoot };
