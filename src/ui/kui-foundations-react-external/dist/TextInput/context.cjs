/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var react = require('react');

const TextInputContext = react.createContext({});
function useTextInputContext() {
  const context = react.useContext(TextInputContext);
  if (!context) {
    throw new Error("TextInputContext must be used within a TextInputRoot");
  }
  return context;
}

exports.TextInputContext = TextInputContext;
exports.useTextInputContext = useTextInputContext;
