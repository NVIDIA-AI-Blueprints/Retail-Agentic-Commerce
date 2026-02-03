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
import { PolymorphicInput } from '../../../lib/components/PolymorphicInput.js';
import useControllableState from '../../../lib/hooks/use-controllable-state.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { TextAreaTestIds } from '../../constants.js';
import { TextAreaContext } from '../../context.js';

const textAreaRoot = cva("nv-text-area-root");
const TextAreaRoot = forwardRef(
  ({
    size,
    status,
    disabled,
    readOnly,
    value,
    defaultValue = "",
    onValueChange,
    className,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = useControllableState({
      value,
      defaultValue,
      onChange: onValueChange
    });
    return /* @__PURE__ */ jsx(
      TextAreaContext.Provider,
      {
        value: {
          disabled,
          readOnly,
          value: internalValue,
          onValueChange: setInternalValue
        },
        children: /* @__PURE__ */ jsx(
          PolymorphicInput,
          {
            ...mergeProps(
              {
                className: textAreaRoot({ className }),
                "data-testid": TextAreaTestIds.TextAreaRoot,
                value: internalValue,
                ref,
                disabled: disabled || readOnly,
                readOnly,
                size,
                status,
                kind: "flat"
              },
              props
            )
          }
        )
      }
    );
  }
);
TextAreaRoot.displayName = "TextAreaRoot";

export { TextAreaRoot };
