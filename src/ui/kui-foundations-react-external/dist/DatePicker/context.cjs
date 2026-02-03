/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var react = require('react');

const DatePickerContext = react.createContext({});
function useDatePickerContext() {
  const context = react.useContext(DatePickerContext);
  if (!context) {
    throw new Error("DatePickerContext must be used within a DatePickerRoot");
  }
  return context;
}
const DatePickerRangeTriggerFieldContext = react.createContext(null);
function useDatePickerRangeTriggerFieldContext() {
  const context = react.useContext(DatePickerRangeTriggerFieldContext);
  if (!context) {
    throw new Error(
      "useDatePickerRangeTriggerFieldContext must be used within a DatePickerRangeTriggerField"
    );
  }
  return context;
}

exports.DatePickerContext = DatePickerContext;
exports.DatePickerRangeTriggerFieldContext = DatePickerRangeTriggerFieldContext;
exports.useDatePickerContext = useDatePickerContext;
exports.useDatePickerRangeTriggerFieldContext = useDatePickerRangeTriggerFieldContext;
