/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { createContext, useContext } from 'react';

const ModalContext = createContext({
  open: false,
  hideCloseButton: false,
  modal: true
});
function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("ModalContext must be used within a ModalRoot");
  }
  return context;
}

export { ModalContext, useModalContext };
