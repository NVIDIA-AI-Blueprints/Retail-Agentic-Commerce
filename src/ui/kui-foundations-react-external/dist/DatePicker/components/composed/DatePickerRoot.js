/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { useId } from 'react';
import { PopoverRoot } from '../../../Popover/index.js';
import useControllableState from '../../../lib/hooks/use-controllable-state.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { DatePickerTestIds } from '../../constants.js';
import { DatePickerContext } from '../../context.js';

const DatePickerRoot = ({
  defaultValue,
  value,
  onValueChange,
  kind,
  format,
  formatFn,
  defaultOpen = false,
  open,
  onOpenChange,
  min,
  max,
  disabledMatcher,
  excludeDisabledDates,
  disabled,
  readOnly,
  size,
  status,
  placeholder,
  dismissible,
  timeZone,
  ...props
}) => {
  const id = useId();
  const [internalOpen, setInternalOpen] = useControllableState({
    defaultValue: defaultOpen,
    value: open,
    onChange: onOpenChange
  });
  const [internalValue, setInternalValue] = useControllableState({
    defaultValue,
    value,
    onChange: onValueChange
  });
  return /* @__PURE__ */ jsx(
    DatePickerContext.Provider,
    {
      value: {
        id,
        kind,
        format,
        formatFn,
        value: internalValue,
        onValueChange: setInternalValue,
        open: internalOpen,
        onOpenChange: setInternalOpen,
        disabledMatcher,
        min,
        max,
        excludeDisabledDates,
        disabled,
        readOnly,
        size,
        status,
        dismissible,
        placeholder,
        timeZone
      },
      children: /* @__PURE__ */ jsx(
        PopoverRoot,
        {
          ...mergeProps(
            {
              "data-testid": DatePickerTestIds.DatePickerRoot,
              open: internalOpen,
              onOpenChange: setInternalOpen
            },
            props
          ),
          children: props.children
        }
      )
    }
  );
};

export { DatePickerRoot };
