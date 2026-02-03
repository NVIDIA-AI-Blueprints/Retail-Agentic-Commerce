/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { createContext, useContext } from 'react';

const DropdownRadioGroupContext = createContext({
  value: void 0,
  onValueChange: void 0
});
function useDropdownRadioGroupContext() {
  const context = useContext(DropdownRadioGroupContext);
  if (!context) {
    throw new Error(
      "DropdownRadioGroupContext must be used within a DropdownRadioGroup"
    );
  }
  return context;
}
const DropdownContext = createContext({
  open: void 0,
  size: void 0
});
function useDropdownContext() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("DropdownContext must be used within a DropdownRoot");
  }
  return context;
}

export { DropdownContext, DropdownRadioGroupContext, useDropdownContext, useDropdownRadioGroupContext };
