/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef, useCallback } from 'react';
import { cva } from 'class-variance-authority';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { TextInputTestIds } from '../../constants.js';
import { useTextInputContext } from '../../context.js';

const textInputElement = cva("nv-text-input-element");
const TextInputElement = forwardRef(({ className, onChange, type = "text", ...props }, ref) => {
  const context = useTextInputContext();
  const handleChange = useCallback(
    (e) => {
      onChange?.(e);
      if (!e.defaultPrevented) {
        context.onValueChange?.(e.target.value);
      }
    },
    [onChange, context]
  );
  return /* @__PURE__ */ jsx(
    Primitive.input,
    {
      ...mergeProps(
        {
          className: textInputElement({ className }),
          ref,
          value: context.value,
          disabled: context.disabled || context.readOnly,
          readOnly: context.readOnly,
          "data-testid": TextInputTestIds.TextInputElement
        },
        props
      ),
      type,
      onChange: handleChange
    }
  );
});
TextInputElement.displayName = "TextInputElement";

export { TextInputElement };
