/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var react = require('react');

const ComboboxContext = react.createContext(
  {}
);
function useComboboxContext() {
  const context = react.useContext(ComboboxContext);
  if (!context) {
    throw new Error("ComboboxContext must be used within a ComboboxRoot");
  }
  return context;
}

exports.ComboboxContext = ComboboxContext;
exports.useComboboxContext = useComboboxContext;
