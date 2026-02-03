/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import * as RadixSlider from '@radix-ui/react-slider';
import { cva } from 'class-variance-authority';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { SliderTestIds } from '../../constants.js';
import { useSliderContext } from '../../context.js';

const sliderRange = cva("nv-slider-range", {
  variants: {
    orientation: {
      horizontal: "",
      vertical: "nv-slider-range--orientation-vertical"
    }
  },
  defaultVariants: {
    orientation: "horizontal"
  }
});
const SliderRange = forwardRef(
  ({ className, ...props }, ref) => {
    const context = useSliderContext();
    return /* @__PURE__ */ jsx(RadixSlider.Range, { asChild: true, children: /* @__PURE__ */ jsx(
      Primitive.span,
      {
        ...mergeProps(
          {
            className: sliderRange({
              className,
              orientation: context.orientation
            }),
            ref,
            "data-testid": SliderTestIds.SliderRange
          },
          props
        )
      }
    ) });
  }
);
SliderRange.displayName = "SliderRange";

export { SliderRange };
