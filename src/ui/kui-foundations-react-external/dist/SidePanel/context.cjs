/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var react = require('react');

const SidePanelContext = react.createContext({
  modal: false,
  open: false,
  hideCloseButton: false
});
function useSidePanelContext() {
  const context = react.useContext(SidePanelContext);
  if (!context) {
    throw new Error("SidePanelContext must be used within a SidePanelRoot");
  }
  return context;
}

exports.SidePanelContext = SidePanelContext;
exports.useSidePanelContext = useSidePanelContext;
