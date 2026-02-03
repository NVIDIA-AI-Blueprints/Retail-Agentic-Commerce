/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import React from 'react';
import { ComboboxProvider } from '@ariakit/react';
import { ComboboxContext } from '../../context.js';

const INITIAL_SELECTED_VALUES = [];
function ComboboxRoot({
  children,
  defaultOpen,
  defaultSelectedValue,
  defaultValue,
  disabled = false,
  multiple = false,
  onOpenChange,
  onSelectedValueChange,
  onValueChange,
  open,
  readOnly = false,
  selectedValue,
  side,
  size = "medium",
  value,
  withCustomValueRendering = false
}) {
  const [selectedInputValue, setSelectedInputValue] = React.useState("");
  const contextValue = React.useMemo(
    () => ({
      selectedInputValue,
      setSelectedInputValue,
      size,
      readOnly,
      disabled
    }),
    [size, readOnly, disabled, selectedInputValue, setSelectedInputValue]
  );
  const internalDefaultSelectedValue = multiple ? INITIAL_SELECTED_VALUES : "";
  const internalDefaultValue = !multiple && !withCustomValueRendering && defaultSelectedValue ? defaultSelectedValue : defaultValue;
  return /* @__PURE__ */ jsx(ComboboxContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsx(
    ComboboxProvider,
    {
      resetValueOnHide: multiple || withCustomValueRendering,
      placement: side,
      defaultOpen,
      setOpen: onOpenChange,
      open: readOnly || disabled ? false : open,
      defaultSelectedValue: defaultSelectedValue ?? internalDefaultSelectedValue,
      setSelectedValue: onSelectedValueChange,
      selectedValue,
      defaultValue: defaultValue ?? internalDefaultValue,
      setValue: onValueChange,
      value,
      children
    }
  ) });
}
ComboboxRoot.displayName = "ComboboxRoot";

export { ComboboxRoot };
