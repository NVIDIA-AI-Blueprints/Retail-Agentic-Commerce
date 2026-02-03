/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsxs, jsx } from 'react/jsx-runtime';
import { forwardRef } from 'react';
import { DatePickerCalendar } from '../composed/DatePickerCalendar.js';
import { DatePickerContent } from '../composed/DatePickerContent.js';
import { DatePickerInput } from '../composed/DatePickerInput.js';
import { DatePickerRangeTrigger } from '../composed/DatePickerRangeTrigger.js';
import { DatePickerRangeTriggerField } from '../composed/DatePickerRangeTriggerField.js';
import { DatePickerRoot } from '../composed/DatePickerRoot.js';
import { DatePickerTrigger } from '../composed/DatePickerTrigger.js';

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
  return /* @__PURE__ */ jsxs(
    DatePickerRoot,
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
        /* @__PURE__ */ jsx(DatePickerTrigger, { ref, ...props, children: /* @__PURE__ */ jsx(DatePickerInput, { ...attributes?.DatePickerInput }) }),
        /* @__PURE__ */ jsx(
          DatePickerContent,
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
            children: /* @__PURE__ */ jsx(
              DatePickerCalendar,
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
  return /* @__PURE__ */ jsxs(
    DatePickerRoot,
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
        /* @__PURE__ */ jsxs(DatePickerRangeTrigger, { ref, ...props, children: [
          /* @__PURE__ */ jsx(
            DatePickerRangeTriggerField,
            {
              field: "from",
              ...attributes?.DatePickerRangeTriggerFieldFrom,
              children: /* @__PURE__ */ jsx(DatePickerInput, { ...attributes?.DatePickerInputFrom })
            }
          ),
          /* @__PURE__ */ jsx(
            DatePickerRangeTriggerField,
            {
              field: "to",
              ...attributes?.DatePickerRangeTriggerFieldTo,
              children: /* @__PURE__ */ jsx(DatePickerInput, { ...attributes?.DatePickerInputTo })
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          DatePickerContent,
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
            children: /* @__PURE__ */ jsx(
              DatePickerCalendar,
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
const DatePicker = forwardRef(function DatePickerComponent(props, ref) {
  if (props.kind === "range") {
    return RangeDatePicker(props, ref);
  }
  return SingleDatePicker(props, ref);
});
DatePicker.displayName = "DatePicker";

export { DatePicker };
