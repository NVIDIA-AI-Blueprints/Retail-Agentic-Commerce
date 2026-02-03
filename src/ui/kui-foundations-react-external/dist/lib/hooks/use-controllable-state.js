/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { useState, useEffect, useCallback } from 'react';

function useControllableState({
  value: controlledValue,
  defaultValue,
  onChange
}) {
  const isControlled = controlledValue !== void 0;
  const [internalState, setInternalState] = useState(
    isControlled ? controlledValue : defaultValue
  );
  useEffect(() => {
    if (isControlled) {
      setInternalState(controlledValue);
    }
  }, [controlledValue, isControlled]);
  const handleValueChange = useCallback(
    (newValue) => {
      if (!isControlled) {
        setInternalState(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange]
  );
  const value = isControlled ? controlledValue : internalState;
  return [value, handleValueChange];
}
var use_controllable_state_default = useControllableState;

export { use_controllable_state_default as default };
