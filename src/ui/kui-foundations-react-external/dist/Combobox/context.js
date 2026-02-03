/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { createContext, useContext } from 'react';

const ComboboxContext = createContext(
  {}
);
function useComboboxContext() {
  const context = useContext(ComboboxContext);
  if (!context) {
    throw new Error("ComboboxContext must be used within a ComboboxRoot");
  }
  return context;
}

export { ComboboxContext, useComboboxContext };
