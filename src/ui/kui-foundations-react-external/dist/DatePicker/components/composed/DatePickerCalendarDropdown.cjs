/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
// foundations-css import removed
var react = require('react');
var classVarianceAuthority = require('class-variance-authority');
var Dropdown = require('../../../Dropdown/index.cjs');
var useControllableState = require('../../../lib/hooks/use-controllable-state.cjs');
var constants = require('../../constants.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var useControllableState__default = /*#__PURE__*/_interopDefault(useControllableState);

const datePickerCalendarDropdown = classVarianceAuthority.cva("nv-date-picker-calendar-dropdown");
const DatePickerCalendarDropdown = react.forwardRef(
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
    const [internalOpen, setInternalOpen] = useControllableState__default.default({
      defaultValue: defaultOpen,
      value: open,
      onChange: onOpenChange
    });
    const [debouncedInternalOpen, setDebouncedInternalOpen] = react.useState(internalOpen);
    react.useEffect(() => {
      setTimeout(() => {
        setDebouncedInternalOpen(internalOpen);
      });
    }, [internalOpen]);
    const contentRef = react.useRef(null);
    react.useImperativeHandle(
      attributes?.DropdownContent?.ref,
      () => contentRef.current,
      []
    );
    const handleOpenChange = react.useCallback(
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
    return /* @__PURE__ */ jsxRuntime.jsx(
      Dropdown.Dropdown,
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
        "data-testid": constants.DatePickerTestIds.DatePickerCalendarDropdown
      }
    );
  }
);
DatePickerCalendarDropdown.displayName = "DatePickerCalendarDropdown";

exports.DatePickerCalendarDropdown = DatePickerCalendarDropdown;
