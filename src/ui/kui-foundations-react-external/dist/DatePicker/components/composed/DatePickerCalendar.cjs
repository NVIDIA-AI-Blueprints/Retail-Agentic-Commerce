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
var reactDayPicker = require('react-day-picker');
var classVarianceAuthority = require('class-variance-authority');
var Button = require('../../../Button/index.cjs');
var Flex = require('../../../Flex/index.cjs');
var Icon = require('../../../lib/components/Icon.cjs');
var useControllableState = require('../../../lib/hooks/use-controllable-state.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');
var utils = require('../../utils.cjs');
var DatePickerCalendarDropdown = require('./DatePickerCalendarDropdown.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var useControllableState__default = /*#__PURE__*/_interopDefault(useControllableState);

const datePickerCalendar = classVarianceAuthority.cva("nv-date-picker-calendar");
const datePickerCalendarCaption = classVarianceAuthority.cva("nv-date-picker-calendar-caption", {
  variants: {
    kind: {
      single: "",
      range: "nv-date-picker-calendar-caption--range"
    }
  }
});
const datePickerCalendarDay = classVarianceAuthority.cva("nv-date-picker-calendar-day", {
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
const datePickerCalendarCell = classVarianceAuthority.cva("nv-date-picker-calendar-cell", {
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
  const context$1 = context.useDatePickerContext();
  if (changed && !utils.isDatePickerValueEqual(context$1.value, internalValue)) {
    return /* @__PURE__ */ jsxRuntime.jsxs(Flex.Flex, { gap: "2", justify: "end", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        Button.Button,
        {
          size: "small",
          kind: "tertiary",
          onClick: onCancel,
          "data-testid": constants.DatePickerTestIds.DatePickerCalendarCancelButton,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        Button.Button,
        {
          size: "small",
          kind: "primary",
          onClick: onApply,
          "data-testid": constants.DatePickerTestIds.DatePickerCalendarApplyButton,
          children: "Apply"
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntime.jsx(Flex.Flex, { gap: "2", justify: "end", children: /* @__PURE__ */ jsxRuntime.jsx(
    Button.Button,
    {
      size: "small",
      kind: "tertiary",
      onClick: onTodayClick,
      "data-testid": constants.DatePickerTestIds.DatePickerCalendarTodayButton,
      children: "Today"
    }
  ) });
};
const DatePickerCalendar = react.forwardRef(
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
    const context$1 = context.useDatePickerContext();
    const [internalMonth, setInternalMonth] = useControllableState__default.default({
      defaultValue: defaultMonth,
      value: month,
      onChange: onMonthChange
    });
    const [internalValue, setInternalValue] = react.useState(context$1.value);
    const changed = react.useRef(false);
    const createDropdownAdapter = react.useCallback(
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
            slotLeft: /* @__PURE__ */ jsxRuntime.jsx("div", { style: { height: "14px", width: "14px" }, children: adaptedValue === option.value && /* @__PURE__ */ jsxRuntime.jsx(Icon.Icon, { name: "check" }) }),
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
        return /* @__PURE__ */ jsxRuntime.jsx(DatePickerCalendarDropdown.DatePickerCalendarDropdown, { ...adaptedProps });
      },
      [renderDropdown]
    );
    react.useEffect(() => {
      setInternalValue(context$1.value);
      changed.current = false;
    }, [context$1.value, setInternalValue]);
    const handleDateSelect = react.useCallback(
      (value) => {
        changed.current = true;
        setInternalValue(value);
      },
      [setInternalValue]
    );
    const dayPickerBaseProps = react.useMemo(() => {
      switch (context$1.kind) {
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
            min: context$1.min,
            max: context$1.max,
            excludeDisabled: context$1.excludeDisabledDates
          };
        default:
          return {};
      }
    }, [
      context$1.kind,
      context$1.min,
      context$1.max,
      context$1.excludeDisabledDates,
      internalValue,
      handleDateSelect
    ]);
    return /* @__PURE__ */ jsxRuntime.jsx(
      reactDayPicker.DayPicker,
      {
        ...mergeProps.mergeProps(
          {
            "data-testid": constants.DatePickerTestIds.DatePickerCalendar,
            ref,
            ...dayPickerBaseProps
          },
          props
        ),
        timeZone: context$1.timeZone,
        defaultMonth: utils.isDate(internalValue) ? new Date(internalValue) : internalValue?.from,
        startMonth,
        endMonth,
        disabled: context$1.disabledMatcher,
        autoFocus: false,
        footer: /* @__PURE__ */ jsxRuntime.jsx(
          DatePickerCalendarFooter,
          {
            onTodayClick: () => setInternalMonth(utils.getZonedTime(/* @__PURE__ */ new Date(), context$1.timeZone)),
            context: context$1,
            internalValue,
            changed: changed.current,
            onApply: () => {
              if (context$1.onValueChange) {
                if (context$1.kind === "single" && utils.isDate(internalValue)) {
                  context$1.onValueChange(internalValue);
                } else if (context$1.kind === "range" && utils.isDateRange(internalValue)) {
                  context$1.onValueChange(internalValue);
                } else {
                  context$1.onValueChange(void 0);
                }
              }
              changed.current = false;
            },
            onCancel: () => {
              setInternalValue(context$1.value);
              changed.current = false;
            }
          }
        ),
        month: internalMonth,
        onMonthChange: setInternalMonth,
        numberOfMonths: context$1.kind === "range" ? 2 : 1,
        navLayout: "around",
        hideNavigation: context$1.kind !== "range",
        showOutsideDays: true,
        captionLayout: context$1.kind === "range" ? "label" : "dropdown",
        classNames: {
          root: datePickerCalendar({ className }),
          today: "nv-date-picker-calendar-day--today",
          caption_label: "nv-date-picker-calendar-caption-label",
          weekdays: "nv-date-picker-calendar-weekdays",
          weeks: "nv-date-picker-calendar-weeks",
          week: "nv-date-picker-calendar-week",
          dropdowns: "nv-date-picker-calendar-dropdown-container",
          day: datePickerCalendarCell({ kind: context$1.kind }),
          footer: "nv-date-picker-calendar-footer",
          outside: "nv-date-picker-calendar-day--outside",
          disabled: "nv-date-picker-calendar-day--disabled",
          selected: "nv-date-picker-calendar-day--selected",
          months: "nv-date-picker-calendar-months",
          month: "nv-date-picker-calendar-month",
          month_grid: "nv-date-picker-calendar-month-grid",
          month_caption: datePickerCalendarCaption({ kind: context$1.kind }),
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
          }) => /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              ...props2,
              "data-testid": constants.DatePickerTestIds.DatePickerCalendarDay,
              disabled: modifiers.disabled || modifiers.outside || props2.disabled,
              className: datePickerCalendarDay({
                disabled: modifiers.disabled,
                outside: modifiers.outside,
                selected: modifiers.selected
              })
            }
          ),
          NextMonthButton: (props2) => /* @__PURE__ */ jsxRuntime.jsx(
            Button.Button,
            {
              ...props2,
              color: "neutral",
              kind: "tertiary",
              size: "small",
              "data-testid": constants.DatePickerTestIds.DatePickerCalendarNextButton,
              children: /* @__PURE__ */ jsxRuntime.jsx(Icon.Icon, { name: "chevron-right" })
            }
          ),
          PreviousMonthButton: (props2) => /* @__PURE__ */ jsxRuntime.jsx(
            Button.Button,
            {
              ...props2,
              size: "small",
              color: "neutral",
              kind: "tertiary",
              "data-testid": constants.DatePickerTestIds.DatePickerCalendarPrevButton,
              children: /* @__PURE__ */ jsxRuntime.jsx(Icon.Icon, { name: "chevron-left" })
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

exports.DatePickerCalendar = DatePickerCalendar;
