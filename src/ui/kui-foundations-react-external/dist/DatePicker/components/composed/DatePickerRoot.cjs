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
var Popover = require('../../../Popover/index.cjs');
var useControllableState = require('../../../lib/hooks/use-controllable-state.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var useControllableState__default = /*#__PURE__*/_interopDefault(useControllableState);

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
  const id = react.useId();
  const [internalOpen, setInternalOpen] = useControllableState__default.default({
    defaultValue: defaultOpen,
    value: open,
    onChange: onOpenChange
  });
  const [internalValue, setInternalValue] = useControllableState__default.default({
    defaultValue,
    value,
    onChange: onValueChange
  });
  return /* @__PURE__ */ jsxRuntime.jsx(
    context.DatePickerContext.Provider,
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
      children: /* @__PURE__ */ jsxRuntime.jsx(
        Popover.PopoverRoot,
        {
          ...mergeProps.mergeProps(
            {
              "data-testid": constants.DatePickerTestIds.DatePickerRoot,
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

exports.DatePickerRoot = DatePickerRoot;
