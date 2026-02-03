/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var react = require('react');

const TextAreaContext = react.createContext({});
function useTextAreaContext() {
  const context = react.useContext(TextAreaContext);
  if (!context) {
    throw new Error("TextAreaContext must be used within a TextAreaRoot");
  }
  return context;
}

exports.TextAreaContext = TextAreaContext;
exports.useTextAreaContext = useTextAreaContext;
