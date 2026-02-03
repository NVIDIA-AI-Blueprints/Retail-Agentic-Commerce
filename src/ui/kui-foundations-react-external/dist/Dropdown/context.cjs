/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var react = require('react');

const DropdownRadioGroupContext = react.createContext({
  value: void 0,
  onValueChange: void 0
});
function useDropdownRadioGroupContext() {
  const context = react.useContext(DropdownRadioGroupContext);
  if (!context) {
    throw new Error(
      "DropdownRadioGroupContext must be used within a DropdownRadioGroup"
    );
  }
  return context;
}
const DropdownContext = react.createContext({
  open: void 0,
  size: void 0
});
function useDropdownContext() {
  const context = react.useContext(DropdownContext);
  if (!context) {
    throw new Error("DropdownContext must be used within a DropdownRoot");
  }
  return context;
}

exports.DropdownContext = DropdownContext;
exports.DropdownRadioGroupContext = DropdownRadioGroupContext;
exports.useDropdownContext = useDropdownContext;
exports.useDropdownRadioGroupContext = useDropdownRadioGroupContext;
