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

const sliderTrack = cva("nv-slider-track");
const SliderTrack = forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(RadixSlider.Track, { asChild: true, children: /* @__PURE__ */ jsx(
      Primitive.span,
      {
        ...mergeProps(
          {
            className: sliderTrack({ className }),
            ref,
            "data-testid": SliderTestIds.SliderTrack
          },
          props
        )
      }
    ) });
  }
);
SliderTrack.displayName = "SliderTrack";

export { SliderTrack };
