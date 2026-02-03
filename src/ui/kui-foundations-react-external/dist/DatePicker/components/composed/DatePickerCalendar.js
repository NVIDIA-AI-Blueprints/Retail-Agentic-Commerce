/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx, jsxs } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef, useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import { cva } from 'class-variance-authority';
import { Button } from '../../../Button/index.js';
import { Flex } from '../../../Flex/index.js';
import { Icon } from '../../../lib/components/Icon.js';
import useControllableState from '../../../lib/hooks/use-controllable-state.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { DatePickerTestIds } from '../../constants.js';
import { useDatePickerContext } from '../../context.js';
import { isDate, isDateRange, getZonedTime, isDatePickerValueEqual } from '../../utils.js';
import { DatePickerCalendarDropdown } from './DatePickerCalendarDropdown.js';

const datePickerCalendar = cva("nv-date-picker-calendar");
const datePickerCalendarCaption = cva("nv-date-picker-calendar-caption", {
  variants: {
    kind: {
      single: "",
      range: "nv-date-picker-calendar-caption--range"
    }
  }
});
const datePickerCalendarDay = cva("nv-date-picker-calendar-day", {
  variants: {
    outside: {
      true: "nv-date-picker-calendar-day--outside"
    },
    disabled: {
      true: "nv-date-picker-calendar-day--disabled"
    },
    selected: {
      true: "nv-date-picker-calendar-day--selected"
    }
  }
});
const datePickerCalendarCell = cva("nv-date-picker-calendar-cell", {
  variants: {
    kind: {
      single: "",
      range: "nv-date-picker-calendar-cell--range"
    }
  }
});
const DatePickerCalendarFooter = ({
  onTodayClick,
  internalValue,
  onApply,
  onCancel,
  changed
}) => {
  const context = useDatePickerContext();
  if (changed && !isDatePickerValueEqual(context.value, internalValue)) {
    return /* @__PURE__ */ jsxs(Flex, { gap: "2", justify: "end", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          size: "small",
          kind: "tertiary",
          onClick: onCancel,
          "data-testid": DatePickerTestIds.DatePickerCalendarCancelButton,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          size: "small",
          kind: "primary",
          onClick: onApply,
          "data-testid": DatePickerTestIds.DatePickerCalendarApplyButton,
          children: "Apply"
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsx(Flex, { gap: "2", justify: "end", children: /* @__PURE__ */ jsx(
    Button,
    {
      size: "small",
      kind: "tertiary",
      onClick: onTodayClick,
      "data-testid": DatePickerTestIds.DatePickerCalendarTodayButton,
      children: "Today"
    }
  ) });
};
const DatePickerCalendar = forwardRef(
  ({
    className,
    renderDropdown,
    defaultMonth = /* @__PURE__ */ new Date(),
    startMonth,
    endMonth,
    month,
    onMonthChange,
    ...props
  }, ref) => {
    const context = useDatePickerContext();
    const [internalMonth, setInternalMonth] = useControllableState({
      defaultValue: defaultMonth,
      value: month,
      onChange: onMonthChange
    });
    const [internalValue, setInternalValue] = useState(context.value);
    const changed = useRef(false);
    const createDropdownAdapter = useCallback(
      (dayPickerProps, kind) => {
        const adaptedValue = typeof dayPickerProps.value === "string" || typeof dayPickerProps.value === "number" ? dayPickerProps.value : void 0;
        const trigger = dayPickerProps.options?.find(
          (option) => option.value === adaptedValue
        );
        const adaptedProps = {
          kind,
          className: dayPickerProps.className,
          items: dayPickerProps.options?.map((option) => ({
            attributes: {
              DropdownItem: {
                "data-state": option.value === adaptedValue ? "checked" : "unchecked"
              }
            },
            slotLeft: /* @__PURE__ */ jsx("div", { style: { height: "14px", width: "14px" }, children: adaptedValue === option.value && /* @__PURE__ */ jsx(Icon, { name: "check" }) }),
            children: option.label,
            filterValue: option.value.toString(),
            disabled: option.disabled
          })) ?? [],
          onItemSelect: (_event, item) => {
            if (dayPickerProps.onChange) {
              const syntheticEvent = {
                target: { value: item.filterValue }
              };
              dayPickerProps.onChange(syntheticEvent);
            }
          },
          children: trigger?.label
        };
        if (renderDropdown) {
          return renderDropdown(adaptedProps);
        }
        return /* @__PURE__ */ jsx(DatePickerCalendarDropdown, { ...adaptedProps });
      },
      [renderDropdown]
    );
    useEffect(() => {
      setInternalValue(context.value);
      changed.current = false;
    }, [context.value, setInternalValue]);
    const handleDateSelect = useCallback(
      (value) => {
        changed.current = true;
        setInternalValue(value);
      },
      [setInternalValue]
    );
    const dayPickerBaseProps = useMemo(() => {
      switch (context.kind) {
        case "single":
          return {
            mode: "single",
            selected: internalValue,
            onSelect: handleDateSelect
          };
        case "range":
          return {
            mode: "range",
            selected: internalValue,
            onSelect: handleDateSelect,
            min: context.min,
            max: context.max,
            excludeDisabled: context.excludeDisabledDates
          };
        default:
          return {};
      }
    }, [
      context.kind,
      context.min,
      context.max,
      context.excludeDisabledDates,
      internalValue,
      handleDateSelect
    ]);
    return /* @__PURE__ */ jsx(
      DayPicker,
      {
        ...mergeProps(
          {
            "data-testid": DatePickerTestIds.DatePickerCalendar,
            ref,
            ...dayPickerBaseProps
          },
          props
        ),
        timeZone: context.timeZone,
        defaultMonth: isDate(internalValue) ? new Date(internalValue) : internalValue?.from,
        startMonth,
        endMonth,
        disabled: context.disabledMatcher,
        autoFocus: false,
        footer: /* @__PURE__ */ jsx(
          DatePickerCalendarFooter,
          {
            onTodayClick: () => setInternalMonth(getZonedTime(/* @__PURE__ */ new Date(), context.timeZone)),
            context,
            internalValue,
            changed: changed.current,
            onApply: () => {
              if (context.onValueChange) {
                if (context.kind === "single" && isDate(internalValue)) {
                  context.onValueChange(internalValue);
                } else if (context.kind === "range" && isDateRange(internalValue)) {
                  context.onValueChange(internalValue);
                } else {
                  context.onValueChange(void 0);
                }
              }
              changed.current = false;
            },
            onCancel: () => {
              setInternalValue(context.value);
              changed.current = false;
            }
          }
        ),
        month: internalMonth,
        onMonthChange: setInternalMonth,
        numberOfMonths: context.kind === "range" ? 2 : 1,
        navLayout: "around",
        hideNavigation: context.kind !== "range",
        showOutsideDays: true,
        captionLayout: context.kind === "range" ? "label" : "dropdown",
        classNames: {
          root: datePickerCalendar({ className }),
          today: "nv-date-picker-calendar-day--today",
          caption_label: "nv-date-picker-calendar-caption-label",
          weekdays: "nv-date-picker-calendar-weekdays",
          weeks: "nv-date-picker-calendar-weeks",
          week: "nv-date-picker-calendar-week",
          dropdowns: "nv-date-picker-calendar-dropdown-container",
          day: datePickerCalendarCell({ kind: context.kind }),
          footer: "nv-date-picker-calendar-footer",
          outside: "nv-date-picker-calendar-day--outside",
          disabled: "nv-date-picker-calendar-day--disabled",
          selected: "nv-date-picker-calendar-day--selected",
          months: "nv-date-picker-calendar-months",
          month: "nv-date-picker-calendar-month",
          month_grid: "nv-date-picker-calendar-month-grid",
          month_caption: datePickerCalendarCaption({ kind: context.kind }),
          button_previous: "nv-date-picker-calendar-prev-button",
          button_next: "nv-date-picker-calendar-next-button",
          weekday: "nv-date-picker-calendar-weekday",
          range_middle: "nv-date-picker-calendar-range-middle",
          range_start: "nv-date-picker-calendar-range-start",
          range_end: "nv-date-picker-calendar-range-end"
        },
        components: {
          DayButton: ({
            modifiers,
            className: _className,
            day: _day,
            ...props2
          }) => /* @__PURE__ */ jsx(
            "button",
            {
              ...props2,
              "data-testid": DatePickerTestIds.DatePickerCalendarDay,
              disabled: modifiers.disabled || modifiers.outside || props2.disabled,
              className: datePickerCalendarDay({
                disabled: modifiers.disabled,
                outside: modifiers.outside,
                selected: modifiers.selected
              })
            }
          ),
          NextMonthButton: (props2) => /* @__PURE__ */ jsx(
            Button,
            {
              ...props2,
              color: "neutral",
              kind: "tertiary",
              size: "small",
              "data-testid": DatePickerTestIds.DatePickerCalendarNextButton,
              children: /* @__PURE__ */ jsx(Icon, { name: "chevron-right" })
            }
          ),
          PreviousMonthButton: (props2) => /* @__PURE__ */ jsx(
            Button,
            {
              ...props2,
              size: "small",
              color: "neutral",
              kind: "tertiary",
              "data-testid": DatePickerTestIds.DatePickerCalendarPrevButton,
              children: /* @__PURE__ */ jsx(Icon, { name: "chevron-left" })
            }
          ),
          YearsDropdown: (args) => createDropdownAdapter(args, "year"),
          MonthsDropdown: (args) => createDropdownAdapter(args, "month")
        }
      }
    );
  }
);
DatePickerCalendar.displayName = "DatePickerCalendar";

export { DatePickerCalendar };
