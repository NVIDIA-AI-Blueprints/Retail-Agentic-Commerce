/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var react = require('react');

function useControllableState({
  value: controlledValue,
  defaultValue,
  onChange
}) {
  const isControlled = controlledValue !== void 0;
  const [internalState, setInternalState] = react.useState(
    isControlled ? controlledValue : defaultValue
  );
  react.useEffect(() => {
    if (isControlled) {
      setInternalState(controlledValue);
    }
  }, [controlledValue, isControlled]);
  const handleValueChange = react.useCallback(
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

module.exports = use_controllable_state_default;
