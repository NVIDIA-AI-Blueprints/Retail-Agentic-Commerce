/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var react = require('react');

const PortalContext = react.createContext({
  portalRef: null
});
function usePortalContext() {
  const context = react.useContext(PortalContext);
  if (!context) {
    return { portalRef: void 0 };
  }
  return context;
}

exports.PortalContext = PortalContext;
exports.usePortalContext = usePortalContext;
