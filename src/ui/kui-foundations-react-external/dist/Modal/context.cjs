/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var react = require('react');

const ModalContext = react.createContext({
  open: false,
  hideCloseButton: false,
  modal: true
});
function useModalContext() {
  const context = react.useContext(ModalContext);
  if (!context) {
    throw new Error("ModalContext must be used within a ModalRoot");
  }
  return context;
}

exports.ModalContext = ModalContext;
exports.useModalContext = useModalContext;
