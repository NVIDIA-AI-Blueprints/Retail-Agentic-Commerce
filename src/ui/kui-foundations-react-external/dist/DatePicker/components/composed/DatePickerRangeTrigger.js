/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { Group } from '../../../Group/index.js';
import { PopoverAnchor } from '../../../Popover/index.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { DatePickerTestIds } from '../../constants.js';
import { useDatePickerContext } from '../../context.js';

const datePickerRangeTrigger = cva(
  "nv-date-picker-trigger nv-date-picker-trigger--kind-range"
);
const DatePickerRangeTrigger = forwardRef(({ className, ...props }, ref) => {
  const context = useDatePickerContext();
  return /* @__PURE__ */ jsx(PopoverAnchor, { asChild: true, children: /* @__PURE__ */ jsx(
    Group,
    {
      ...mergeProps(
        {
          ref,
          id: context.id,
          "data-testid": DatePickerTestIds.DatePickerRangeTrigger,
          className: datePickerRangeTrigger({ className })
        },
        props
      )
    }
  ) });
});
DatePickerRangeTrigger.displayName = "DatePickerRangeTrigger";

export { DatePickerRangeTrigger };
