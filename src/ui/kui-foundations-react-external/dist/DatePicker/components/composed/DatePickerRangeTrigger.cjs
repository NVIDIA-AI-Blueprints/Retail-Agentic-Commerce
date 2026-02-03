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
var Group = require('../../../Group/index.cjs');
var Popover = require('../../../Popover/index.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');

const datePickerRangeTrigger = classVarianceAuthority.cva(
  "nv-date-picker-trigger nv-date-picker-trigger--kind-range"
);
const DatePickerRangeTrigger = react.forwardRef(({ className, ...props }, ref) => {
  const context$1 = context.useDatePickerContext();
  return /* @__PURE__ */ jsxRuntime.jsx(Popover.PopoverAnchor, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(
    Group.Group,
    {
      ...mergeProps.mergeProps(
        {
          ref,
          id: context$1.id,
          "data-testid": constants.DatePickerTestIds.DatePickerRangeTrigger,
          className: datePickerRangeTrigger({ className })
        },
        props
      )
    }
  ) });
});
DatePickerRangeTrigger.displayName = "DatePickerRangeTrigger";

exports.DatePickerRangeTrigger = DatePickerRangeTrigger;
