/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import React from 'react';
import { SelectProvider } from '@ariakit/react';

const SelectContext = React.createContext({});
function useSelectContext() {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("SelectContext must be used within a SelectRoot");
  }
  return context;
}
const INITIAL_SELECTED_VALUES = [];
function SelectRoot({
  children,
  defaultOpen,
  defaultValue: _defaultValue,
  disabled,
  multiple,
  onOpenChange,
  onValueChange,
  open,
  readOnly,
  side,
  size = "medium",
  value
}) {
  const defaultValue = React.useMemo(() => {
    if (_defaultValue !== void 0) return _defaultValue;
    return multiple ? [] : "";
  }, [_defaultValue, multiple]);
  const internalDefaultSelectedValue = multiple ? INITIAL_SELECTED_VALUES : "";
  const contextValue = React.useMemo(
    () => ({ size, disabled, readOnly }),
    [size, disabled, readOnly]
  );
  return /* @__PURE__ */ jsx(SelectContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsx(
    SelectProvider,
    {
      defaultOpen,
      defaultValue: defaultValue ?? internalDefaultSelectedValue,
      open: readOnly || disabled ? false : open,
      placement: side,
      setOpen: onOpenChange,
      setValue: onValueChange,
      value,
      children
    }
  ) });
}
SelectRoot.displayName = "SelectRoot";

export { SelectContext, SelectRoot, useSelectContext };
