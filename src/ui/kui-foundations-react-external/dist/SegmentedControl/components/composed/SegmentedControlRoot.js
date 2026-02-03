/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { Root } from '@radix-ui/react-toggle-group';
import { cva } from 'class-variance-authority';
import { Primitive } from '../../../lib/components/primitive.js';
import { SegmentedControlTestIds } from '../../constants.js';

const segmentedControlRoot = cva(
  "nv-segmented-control-root nv-button-group nv-button-group--kind-tertiary",
  {
    variants: {
      size: {
        tiny: "nv-button-group--size-tiny",
        small: "nv-button-group--size-small",
        medium: "nv-button-group--size-medium",
        large: "nv-button-group--size-large"
      }
    }
  }
);
const SegmentedControlRoot = forwardRef(({ className, onValueChange, value, size, defaultValue, ...props }, ref) => /* @__PURE__ */ jsx(
  Root,
  {
    onValueChange,
    value,
    defaultValue,
    asChild: true,
    type: "single",
    children: /* @__PURE__ */ jsx(
      Primitive.div,
      {
        className: segmentedControlRoot({ className, size }),
        "data-testid": SegmentedControlTestIds.SegmentedControlRoot,
        ref,
        ...props
      }
    )
  }
));
SegmentedControlRoot.displayName = Root.displayName;

export { SegmentedControlRoot };
