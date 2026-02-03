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
var Popover = require('../../../Popover/index.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');

const datePickerContent = classVarianceAuthority.cva("nv-date-picker-content");
const DatePickerContent = react.forwardRef(({ className, onInteractOutside, ...props }, ref) => {
  const context$1 = context.useDatePickerContext();
  const handleInteractOutside = react.useCallback(
    (event) => {
      if (event.target instanceof Node && context$1.id) {
        const container = document.getElementById(context$1.id);
        if (container && (event.target instanceof HTMLElement && event.target.id === context$1.id || container.contains(event.target))) {
          event.preventDefault();
          return;
        }
      }
      onInteractOutside?.(event);
    },
    [context$1, onInteractOutside]
  );
  return /* @__PURE__ */ jsxRuntime.jsx(
    Popover.PopoverContent,
    {
      ...mergeProps.mergeProps(
        {
          className: datePickerContent({ className }),
          ref,
          "data-testid": constants.DatePickerTestIds.DatePickerContent,
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

exports.DatePickerContent = DatePickerContent;
