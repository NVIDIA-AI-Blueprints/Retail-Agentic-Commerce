/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef, useCallback } from 'react';
import { cva } from 'class-variance-authority';
import { PopoverContent } from '../../../Popover/index.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { DatePickerTestIds } from '../../constants.js';
import { useDatePickerContext } from '../../context.js';

const datePickerContent = cva("nv-date-picker-content");
const DatePickerContent = forwardRef(({ className, onInteractOutside, ...props }, ref) => {
  const context = useDatePickerContext();
  const handleInteractOutside = useCallback(
    (event) => {
      if (event.target instanceof Node && context.id) {
        const container = document.getElementById(context.id);
        if (container && (event.target instanceof HTMLElement && event.target.id === context.id || container.contains(event.target))) {
          event.preventDefault();
          return;
        }
      }
      onInteractOutside?.(event);
    },
    [context, onInteractOutside]
  );
  return /* @__PURE__ */ jsx(
    PopoverContent,
    {
      ...mergeProps(
        {
          className: datePickerContent({ className }),
          ref,
          "data-testid": DatePickerTestIds.DatePickerContent,
          onPointerDownOutside: handleInteractOutside,
          onInteractOutside: handleInteractOutside
        },
        props
      ),
      align: "start",
      onOpenAutoFocus: (event) => event.preventDefault()
    }
  );
});
DatePickerContent.displayName = "DatePickerContent";

export { DatePickerContent };
