/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
var react = require('react');
var DatePickerCalendar = require('../composed/DatePickerCalendar.cjs');
var DatePickerContent = require('../composed/DatePickerContent.cjs');
var DatePickerInput = require('../composed/DatePickerInput.cjs');
var DatePickerRangeTrigger = require('../composed/DatePickerRangeTrigger.cjs');
var DatePickerRangeTriggerField = require('../composed/DatePickerRangeTriggerField.cjs');
var DatePickerRoot = require('../composed/DatePickerRoot.cjs');
var DatePickerTrigger = require('../composed/DatePickerTrigger.cjs');

function SingleDatePicker({
  open,
  onOpenChange,
  defaultOpen,
  modal,
  attributes,
  align,
  side,
  onCloseAutoFocus,
  onEscapeKeyDown,
  onPointerDownOutside,
  onInteractOutside,
  portal,
  portalContainer,
  forceMount,
  defaultValue,
  value,
  onValueChange,
  format,
  formatFn,
  disabledMatcher,
  disabled,
  readOnly,
  size,
  status,
  dismissible,
  placeholder,
  renderDropdown,
  startMonth,
  endMonth,
  defaultMonth,
  month,
  onMonthChange,
  timeZone,
  kind: _kind,
  ...props
}, ref) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    DatePickerRoot.DatePickerRoot,
    {
      kind: "single",
      value,
      defaultValue,
      onValueChange,
      format,
      formatFn,
      disabledMatcher,
      open,
      onOpenChange,
      defaultOpen,
      modal,
      disabled,
      readOnly,
      size,
      status,
      dismissible,
      placeholder,
      timeZone,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(DatePickerTrigger.DatePickerTrigger, { ref, ...props, children: /* @__PURE__ */ jsxRuntime.jsx(DatePickerInput.DatePickerInput, { ...attributes?.DatePickerInput }) }),
        /* @__PURE__ */ jsxRuntime.jsx(
          DatePickerContent.DatePickerContent,
          {
            forceMount,
            align,
            side,
            onCloseAutoFocus,
            onEscapeKeyDown,
            onPointerDownOutside,
            onInteractOutside,
            portal,
            portalContainer,
            ...attributes?.DatePickerContent,
            children: /* @__PURE__ */ jsxRuntime.jsx(
              DatePickerCalendar.DatePickerCalendar,
              {
                startMonth,
                endMonth,
                defaultMonth,
                month,
                onMonthChange,
                renderDropdown,
                ...attributes?.DatePickerCalendar
              }
            )
          }
        )
      ]
    }
  );
}
function RangeDatePicker({
  open,
  onOpenChange,
  defaultOpen,
  modal,
  attributes,
  align,
  side,
  onCloseAutoFocus,
  onEscapeKeyDown,
  onPointerDownOutside,
  onInteractOutside,
  portal,
  portalContainer,
  forceMount,
  defaultValue,
  value,
  onValueChange,
  format,
  formatFn,
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
  renderDropdown,
  startMonth,
  endMonth,
  defaultMonth,
  month,
  onMonthChange,
  timeZone,
  kind: _kind,
  ...props
}, ref) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    DatePickerRoot.DatePickerRoot,
    {
      kind: "range",
      value,
      defaultValue,
      onValueChange,
      min,
      max,
      excludeDisabledDates,
      format,
      formatFn,
      disabledMatcher,
      open,
      onOpenChange,
      defaultOpen,
      modal,
      disabled,
      readOnly,
      size,
      status,
      dismissible,
      placeholder,
      timeZone,
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs(DatePickerRangeTrigger.DatePickerRangeTrigger, { ref, ...props, children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            DatePickerRangeTriggerField.DatePickerRangeTriggerField,
            {
              field: "from",
              ...attributes?.DatePickerRangeTriggerFieldFrom,
              children: /* @__PURE__ */ jsxRuntime.jsx(DatePickerInput.DatePickerInput, { ...attributes?.DatePickerInputFrom })
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            DatePickerRangeTriggerField.DatePickerRangeTriggerField,
            {
              field: "to",
              ...attributes?.DatePickerRangeTriggerFieldTo,
              children: /* @__PURE__ */ jsxRuntime.jsx(DatePickerInput.DatePickerInput, { ...attributes?.DatePickerInputTo })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(
          DatePickerContent.DatePickerContent,
          {
            forceMount,
            align,
            side,
            onCloseAutoFocus,
            onEscapeKeyDown,
            onPointerDownOutside,
            onInteractOutside,
            portal,
            portalContainer,
            ...attributes?.DatePickerContent,
            children: /* @__PURE__ */ jsxRuntime.jsx(
              DatePickerCalendar.DatePickerCalendar,
              {
                startMonth,
                endMonth,
                defaultMonth,
                month,
                onMonthChange,
                renderDropdown,
                ...attributes?.DatePickerCalendar
              }
            )
          }
        )
      ]
    }
  );
}
const DatePicker = react.forwardRef(function DatePickerComponent(props, ref) {
  if (props.kind === "range") {
    return RangeDatePicker(props, ref);
  }
  return SingleDatePicker(props, ref);
});
DatePicker.displayName = "DatePicker";

exports.DatePicker = DatePicker;
