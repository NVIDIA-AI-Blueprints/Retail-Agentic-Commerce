/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { createContext, useContext } from 'react';

const PortalContext = createContext({
  portalRef: null
});
function usePortalContext() {
  const context = useContext(PortalContext);
  if (!context) {
    return { portalRef: void 0 };
  }
  return context;
}

export { PortalContext, usePortalContext };
