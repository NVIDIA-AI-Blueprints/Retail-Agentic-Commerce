/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import React from 'react';
import { useComboboxContext as useComboboxContext$1, useStoreState, Combobox } from '@ariakit/react';
import { cx } from 'class-variance-authority';
import { useComboboxContext } from '../../context.js';

const ComboboxInput = React.forwardRef(
  ({ className, onBlur, placeholder, resetValueOnBlur = true, ...props }, ref) => {
    const { disabled, readOnly, selectedInputValue } = useComboboxContext();
    const comboboxContext = useComboboxContext$1();
    const selectedValue = useStoreState(comboboxContext, "selectedValue");
    const inputValue = useStoreState(comboboxContext, "value");
    const isMulti = Array.isArray(selectedValue);
    const hasValue = isMulti ? selectedValue.length > 0 : selectedValue;
    const defaultPlaceholder = isMulti ? "Select item(s)" : "Select item";
    const displayValue = isMulti ? selectedValue.join(", ") : selectedValue;
    const handleOnBlur = React.useCallback(
      (e) => {
        if (resetValueOnBlur && !isMulti && selectedInputValue && inputValue !== selectedInputValue) {
          comboboxContext?.setValue(selectedInputValue);
        }
        onBlur?.(e);
      },
      [
        onBlur,
        selectedInputValue,
        inputValue,
        comboboxContext,
        resetValueOnBlur,
        isMulti
      ]
    );
    return /* @__PURE__ */ jsx(
      Combobox,
      {
        "aria-label": typeof displayValue === "string" ? displayValue : defaultPlaceholder,
        onBlur: handleOnBlur,
        className: cx("nv-combobox-input", className),
        disabled: disabled || readOnly,
        placeholder: hasValue ? "" : placeholder ?? defaultPlaceholder,
        ref,
        ...props
      }
    );
  }
);
ComboboxInput.displayName = "ComboboxInput";

export { ComboboxInput };
