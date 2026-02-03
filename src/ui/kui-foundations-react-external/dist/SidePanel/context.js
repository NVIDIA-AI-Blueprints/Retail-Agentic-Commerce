/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { createContext, useContext } from 'react';

const SidePanelContext = createContext({
  modal: false,
  open: false,
  hideCloseButton: false
});
function useSidePanelContext() {
  const context = useContext(SidePanelContext);
  if (!context) {
    throw new Error("SidePanelContext must be used within a SidePanelRoot");
  }
  return context;
}

export { SidePanelContext, useSidePanelContext };
