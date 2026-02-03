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
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');
var hooks = require('../../hooks.cjs');
var utils = require('../../utils.cjs');

const sliderSteps = classVarianceAuthority.cva("nv-slider-steps", {
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
const SliderSteps = react.forwardRef(
  ({ className, stepFormatFn, position, stepInterval, customSteps, ...props }, ref) => {
    const context$1 = context.useSliderContext();
    const steps = react.useMemo(() => {
      if (customSteps?.length) {
        return customSteps.filter(
          (value) => value >= context$1.min && value <= context$1.max
        );
      }
      return utils.generateSteps(
        context$1.min,
        context$1.max,
        stepInterval || context$1.step
      );
    }, [context$1.min, context$1.max, context$1.step, stepInterval, customSteps]);
    const getFormattedValue = react.useCallback(
      (value) => stepFormatFn ? stepFormatFn(value) : utils.formatStep(value),
      [stepFormatFn]
    );
    const thumbDimensions = hooks.useThumbSize(context$1.thumb);
    return /* @__PURE__ */ jsxRuntime.jsx(
      "span",
      {
        ...mergeProps.mergeProps(
          {
            className: sliderSteps({
              className,
              orientation: context$1.orientation,
              position
            }),
            ref,
            "data-testid": constants.SliderTestIds.SliderSteps
          },
          props
        ),
        children: steps.map((value) => /* @__PURE__ */ jsxRuntime.jsxs(
          "span",
          {
            className: "nv-slider-step",
            "data-testid": constants.SliderTestIds.SliderStep,
            style: {
              ...thumbDimensions ? {
                [context$1.orientation == "vertical" ? "bottom" : "left"]: utils.getAlignedStepPositionFromDimensions(
                  value,
                  context$1.min,
                  context$1.max,
                  thumbDimensions,
                  context$1.orientation
                )
              } : { display: "none" }
            },
            children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "nv-slider-step-dot" }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "nv-slider-step-label", children: getFormattedValue(value) })
            ]
          },
          value
        ))
      }
    );
  }
);
SliderSteps.displayName = "SliderSteps";

exports.SliderSteps = SliderSteps;
