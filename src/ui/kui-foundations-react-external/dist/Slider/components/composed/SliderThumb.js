/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef, useRef, useImperativeHandle, useEffect } from 'react';
import * as RadixSlider from '@radix-ui/react-slider';
import { cva } from 'class-variance-authority';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { SliderTestIds } from '../../constants.js';
import { useSliderContext } from '../../context.js';

const sliderThumb = cva("nv-slider-thumb");
const SliderThumb = forwardRef(
  ({ className, ...props }, ref) => {
    const context = useSliderContext();
    const internalRef = useRef(null);
    useImperativeHandle(ref, () => internalRef.current, []);
    useEffect(() => {
      if (internalRef.current && context.setThumb) {
        context.setThumb(internalRef.current);
      }
    }, [context]);
    return /* @__PURE__ */ jsx(RadixSlider.Thumb, { asChild: true, children: /* @__PURE__ */ jsx(
      Primitive.span,
      {
        ...mergeProps(
          {
            className: sliderThumb({ className }),
            ref: internalRef,
            "data-testid": SliderTestIds.SliderThumb
          },
          props
        )
      }
    ) });
  }
);
SliderThumb.displayName = "SliderThumb";

export { SliderThumb };
