/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef, useState, useMemo } from 'react';
import * as RadixSlider from '@radix-ui/react-slider';
import { cva } from 'class-variance-authority';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { SliderTestIds } from '../../constants.js';
import { SliderContext } from '../../context.js';

const sliderRoot = cva("nv-slider-root", {
  variants: {
    orientation: {
      horizontal: "",
      vertical: "nv-slider-root--orientation-vertical"
    }
  },
  defaultVariants: {
    orientation: "horizontal"
  }
});
const SliderRoot = forwardRef(
  ({
    className,
    orientation,
    disabled,
    value,
    kind = "single",
    min = 0,
    max = 100,
    defaultValue = kind === "range" ? [min, max] : min,
    onValueChange,
    onValueCommit,
    step = 1,
    minStepsBetweenThumbs,
    name,
    form,
    ...props
  }, ref) => {
    const [thumb, setThumb] = useState(null);
    const convertedProps = useMemo(
      () => ({
        value: kind === "range" ? value : value !== void 0 ? [value] : void 0,
        defaultValue: kind === "range" ? defaultValue : defaultValue !== void 0 ? [defaultValue] : void 0,
        onValueChange: kind === "range" ? onValueChange : onValueChange ? (nextValue) => onValueChange(nextValue[0]) : void 0,
        onValueCommit: kind === "range" ? onValueCommit : onValueCommit ? (nextValue) => onValueCommit(nextValue[0]) : void 0
      }),
      [defaultValue, kind, onValueChange, onValueCommit, value]
    );
    return /* @__PURE__ */ jsx(
      SliderContext.Provider,
      {
        value: { min, max, step, orientation, thumb, setThumb },
        children: /* @__PURE__ */ jsx(
          RadixSlider.Root,
          {
            disabled,
            min,
            max,
            step,
            minStepsBetweenThumbs,
            name,
            form,
            orientation,
            asChild: true,
            ...convertedProps,
            children: /* @__PURE__ */ jsx(
              Primitive.span,
              {
                ...mergeProps(
                  {
                    className: sliderRoot({ className, orientation }),
                    ref,
                    "data-testid": SliderTestIds.SliderRoot
                  },
                  props
                )
              }
            )
          }
        )
      }
    );
  }
);
SliderRoot.displayName = "SliderRoot";

export { SliderRoot };
