/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import React from 'react';
import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { cva } from 'class-variance-authority';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { CheckboxTestIds } from '../../constants.js';

const checkboxIndicator = cva("nv-checkbox-indicator", {
  variants: {
    error: {
      true: "nv-checkbox-indicator--error"
    }
  }
});
const CheckboxIndicator = React.forwardRef(({ className, checked, error, ...props }, ref) => {
  return /* @__PURE__ */ jsx(RadixCheckbox.Indicator, { forceMount: true, asChild: true, children: /* @__PURE__ */ jsx(
    "svg",
    {
      ...mergeProps(
        {
          ref,
          "data-testid": CheckboxTestIds.Indicator,
          className: checkboxIndicator({ className, error })
        },
        props
      ),
      xmlns: "http://www.w3.org/2000/svg",
      width: "16",
      height: "16",
      viewBox: "0 0 18 18",
      fill: "none",
      children: checked === "indeterminate" ? /* @__PURE__ */ jsx("path", { d: "M4 8L12 8", stroke: "currentColor", strokeWidth: "2" }) : /* @__PURE__ */ jsx(
        "path",
        {
          d: "M3 8L6.18198 11.182L13.253 4.11091",
          stroke: "currentColor",
          strokeWidth: "2"
        }
      )
    }
  ) });
});
CheckboxIndicator.displayName = "CheckboxIndicator";

export { CheckboxIndicator, checkboxIndicator };
