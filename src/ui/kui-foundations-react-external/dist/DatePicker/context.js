/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { createContext, useContext } from 'react';

const DatePickerContext = createContext({});
function useDatePickerContext() {
  const context = useContext(DatePickerContext);
  if (!context) {
    throw new Error("DatePickerContext must be used within a DatePickerRoot");
  }
  return context;
}
const DatePickerRangeTriggerFieldContext = createContext(null);
function useDatePickerRangeTriggerFieldContext() {
  const context = useContext(DatePickerRangeTriggerFieldContext);
  if (!context) {
    throw new Error(
      "useDatePickerRangeTriggerFieldContext must be used within a DatePickerRangeTriggerField"
    );
  }
  return context;
}

export { DatePickerContext, DatePickerRangeTriggerFieldContext, useDatePickerContext, useDatePickerRangeTriggerFieldContext };
