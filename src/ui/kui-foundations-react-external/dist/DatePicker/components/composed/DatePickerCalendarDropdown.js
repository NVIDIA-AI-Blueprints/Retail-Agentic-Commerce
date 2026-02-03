/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef, useState, useEffect, useRef, useImperativeHandle, useCallback } from 'react';
import { cva } from 'class-variance-authority';
import { Dropdown } from '../../../Dropdown/index.js';
import useControllableState from '../../../lib/hooks/use-controllable-state.js';
import { DatePickerTestIds } from '../../constants.js';

const datePickerCalendarDropdown = cva("nv-date-picker-calendar-dropdown");
const DatePickerCalendarDropdown = forwardRef(
  ({
    kind,
    align,
    portal = false,
    attributes,
    open,
    defaultOpen,
    onOpenChange,
    ...props
  }, ref) => {
    const [internalOpen, setInternalOpen] = useControllableState({
      defaultValue: defaultOpen,
      value: open,
      onChange: onOpenChange
    });
    const [debouncedInternalOpen, setDebouncedInternalOpen] = useState(internalOpen);
    useEffect(() => {
      setTimeout(() => {
        setDebouncedInternalOpen(internalOpen);
      });
    }, [internalOpen]);
    const contentRef = useRef(null);
    useImperativeHandle(
      attributes?.DropdownContent?.ref,
      () => contentRef.current,
      []
    );
    const handleOpenChange = useCallback(
      (open2) => {
        setInternalOpen(open2);
        setTimeout(() => {
          if (open2) {
            contentRef.current?.querySelector('[data-state="checked"]')?.scrollIntoView();
          }
        }, 0);
      },
      [setInternalOpen]
    );
    return /* @__PURE__ */ jsx(
      Dropdown,
      {
        ...props,
        ref,
        open: internalOpen,
        onOpenChange: handleOpenChange,
        attributes: {
          ...attributes,
          DropdownContent: {
            ...attributes?.DropdownContent,
            ref: contentRef,
            className: datePickerCalendarDropdown({
              className: attributes?.DropdownContent?.className
            }),
            "data-visible": debouncedInternalOpen ? "true" : "false"
          }
        },
        align: align || kind === "month" ? "start" : "end",
        portal,
        "data-testid": DatePickerTestIds.DatePickerCalendarDropdown
      }
    );
  }
);
DatePickerCalendarDropdown.displayName = "DatePickerCalendarDropdown";

export { DatePickerCalendarDropdown };
