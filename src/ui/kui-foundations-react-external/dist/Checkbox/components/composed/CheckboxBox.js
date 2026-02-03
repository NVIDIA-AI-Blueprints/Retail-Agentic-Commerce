/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import React from 'react';
import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { cva } from 'class-variance-authority';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { CheckboxTestIds } from '../../constants.js';

const checkboxBox = cva("nv-checkbox-box", {
  variants: {
    error: {
      true: "nv-checkbox-box--error"
    }
  }
});
const CheckboxBox = React.forwardRef(
  ({
    className,
    error,
    defaultChecked,
    checked,
    onCheckedChange,
    disabled,
    name,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsx(
      RadixCheckbox.Root,
      {
        asChild: true,
        defaultChecked,
        checked,
        onCheckedChange,
        disabled,
        name,
        children: /* @__PURE__ */ jsx(
          Primitive.button,
          {
            ...mergeProps(
              {
                className: checkboxBox({ className, error }),
                "data-testid": CheckboxTestIds.Box,
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
CheckboxBox.displayName = "CheckboxBox";

export { CheckboxBox };
