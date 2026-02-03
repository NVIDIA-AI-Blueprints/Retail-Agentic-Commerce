/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import * as RadixProgress from '@radix-ui/react-progress';
import { cva } from 'class-variance-authority';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { ProgressBarTestIds } from '../../constants.js';

const progressBar = cva("nv-progress-bar", {
  variants: {
    kind: {
      determinate: "",
      indeterminate: "nv-progress-bar--indeterminate"
    },
    size: {
      small: "nv-progress-bar--size-small",
      medium: "",
      large: "nv-progress-bar--size-large"
    }
  }
});
const ProgressBar = forwardRef(
  ({ className, value, kind, size, ...props }, ref) => {
    return /* @__PURE__ */ jsx(RadixProgress.Root, { asChild: true, value, children: /* @__PURE__ */ jsx(
      "div",
      {
        ...mergeProps(
          {
            className: progressBar({ className, kind, size }),
            "data-testid": ProgressBarTestIds.Track,
            ref
          },
          props
        ),
        children: /* @__PURE__ */ jsx(
          RadixProgress.Indicator,
          {
            className: "nv-progress-bar-indicator",
            "data-testid": ProgressBarTestIds.Indicator,
            style: { width: `${value}%` }
          }
        )
      }
    ) });
  }
);
ProgressBar.displayName = "ProgressBar";

export { ProgressBar };
