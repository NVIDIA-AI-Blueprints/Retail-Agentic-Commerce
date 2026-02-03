/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { createContext, useContext } from 'react';

const TextInputContext = createContext({});
function useTextInputContext() {
  const context = useContext(TextInputContext);
  if (!context) {
    throw new Error("TextInputContext must be used within a TextInputRoot");
  }
  return context;
}

export { TextInputContext, useTextInputContext };
