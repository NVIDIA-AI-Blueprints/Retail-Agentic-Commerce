/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { createContext, useContext } from 'react';

const TextAreaContext = createContext({});
function useTextAreaContext() {
  const context = useContext(TextAreaContext);
  if (!context) {
    throw new Error("TextAreaContext must be used within a TextAreaRoot");
  }
  return context;
}

export { TextAreaContext, useTextAreaContext };
