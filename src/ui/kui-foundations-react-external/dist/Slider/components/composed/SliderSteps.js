/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx, jsxs } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef, useMemo, useCallback } from 'react';
import { cva } from 'class-variance-authority';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { SliderTestIds } from '../../constants.js';
import { useSliderContext } from '../../context.js';
import { useThumbSize } from '../../hooks.js';
import { generateSteps, formatStep, getAlignedStepPositionFromDimensions } from '../../utils.js';

const sliderSteps = cva("nv-slider-steps", {
  variants: {
    orientation: {
      horizontal: "",
      vertical: "nv-slider-steps--orientation-vertical"
    },
    position: {
      bottom: "nv-slider-steps--position-bottom",
      left: "nv-slider-steps--position-left",
      right: "nv-slider-steps--position-right"
    }
  },
  defaultVariants: {
    orientation: "horizontal",
    position: "bottom"
  },
  compoundVariants: [
    {
      orientation: "horizontal",
      position: ["left", "right"],
      class: "nv-slider-steps--position-bottom"
    },
    {
      orientation: "vertical",
      position: "bottom",
      class: "nv-slider-steps--position-right"
    }
  ]
});
const SliderSteps = forwardRef(
  ({ className, stepFormatFn, position, stepInterval, customSteps, ...props }, ref) => {
    const context = useSliderContext();
    const steps = useMemo(() => {
      if (customSteps?.length) {
        return customSteps.filter(
          (value) => value >= context.min && value <= context.max
        );
      }
      return generateSteps(
        context.min,
        context.max,
        stepInterval || context.step
      );
    }, [context.min, context.max, context.step, stepInterval, customSteps]);
    const getFormattedValue = useCallback(
      (value) => stepFormatFn ? stepFormatFn(value) : formatStep(value),
      [stepFormatFn]
    );
    const thumbDimensions = useThumbSize(context.thumb);
    return /* @__PURE__ */ jsx(
      "span",
      {
        ...mergeProps(
          {
            className: sliderSteps({
              className,
              orientation: context.orientation,
              position
            }),
            ref,
            "data-testid": SliderTestIds.SliderSteps
          },
          props
        ),
        children: steps.map((value) => /* @__PURE__ */ jsxs(
          "span",
          {
            className: "nv-slider-step",
            "data-testid": SliderTestIds.SliderStep,
            style: {
              ...thumbDimensions ? {
                [context.orientation == "vertical" ? "bottom" : "left"]: getAlignedStepPositionFromDimensions(
                  value,
                  context.min,
                  context.max,
                  thumbDimensions,
                  context.orientation
                )
              } : { display: "none" }
            },
            children: [
              /* @__PURE__ */ jsx("span", { className: "nv-slider-step-dot" }),
              /* @__PURE__ */ jsx("span", { className: "nv-slider-step-label", children: getFormattedValue(value) })
            ]
          },
          value
        ))
      }
    );
  }
);
SliderSteps.displayName = "SliderSteps";

export { SliderSteps };
