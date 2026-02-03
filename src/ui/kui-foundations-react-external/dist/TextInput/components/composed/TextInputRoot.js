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
import { PolymorphicInput } from '../../../lib/components/PolymorphicInput.js';
import useControllableState from '../../../lib/hooks/use-controllable-state.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { TextInputTestIds } from '../../constants.js';
import { TextInputContext } from '../../context.js';

const textInputRoot = cva("nv-text-input-root");
const TextInputRoot = forwardRef(
  ({
    size,
    status,
    kind = "flat",
    disabled,
    className,
    readOnly,
    value,
    dismissible,
    defaultValue = "",
    onValueChange,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = useControllableState({
      value,
      defaultValue,
      onChange: onValueChange
    });
    const handleDismiss = useCallback(() => {
      setInternalValue("");
    }, [setInternalValue]);
    return /* @__PURE__ */ jsx(
      TextInputContext.Provider,
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
                ref,
                value: internalValue,
                disabled,
                readOnly,
                size,
                status,
                kind,
                dismissible,
                onDismiss: handleDismiss,
                className: textInputRoot({ className }),
                "data-testid": TextInputTestIds.TextInputRoot
              },
              props
            )
          }
        )
      }
    );
  }
);
TextInputRoot.displayName = "TextInputRoot";

export { TextInputRoot };
