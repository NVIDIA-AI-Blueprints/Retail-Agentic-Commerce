/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { createContext } from 'react';

const MenuRadioGroupContext = createContext({
  value: void 0,
  onValueChange: void 0
});
function useMenuRadioGroupContext() {
  const context = MenuRadioGroupContext;
  if (!context) {
    throw new Error(
      "MenuRadioGroupContext must be used within a MenuRadioGroup"
    );
  }
  return context;
}

export { MenuRadioGroupContext, useMenuRadioGroupContext };
