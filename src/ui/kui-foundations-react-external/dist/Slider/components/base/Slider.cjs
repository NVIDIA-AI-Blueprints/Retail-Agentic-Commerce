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
var SliderRange = require('../composed/SliderRange.cjs');
var SliderRoot = require('../composed/SliderRoot.cjs');
var SliderSteps = require('../composed/SliderSteps.cjs');
var SliderThumb = require('../composed/SliderThumb.cjs');
var SliderTrack = require('../composed/SliderTrack.cjs');

const Slider = react.forwardRef(
  ({
    value,
    kind,
    min,
    max,
    defaultValue,
    step,
    stepPosition = "none",
    stepInterval,
    customSteps,
    stepFormatFn,
    onValueChange,
    onValueCommit,
    disabled,
    orientation,
    attributes,
    name,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsxs(
      SliderRoot.SliderRoot,
      {
        ...{
          kind,
          value,
          defaultValue,
          onValueChange,
          onValueCommit
        },
        orientation,
        disabled,
        min,
        max,
        step,
        ref,
        name,
        ...props,
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(SliderTrack.SliderTrack, { ...attributes?.SliderTrack, children: /* @__PURE__ */ jsxRuntime.jsx(SliderRange.SliderRange, { ...attributes?.SliderRange }) }),
          /* @__PURE__ */ jsxRuntime.jsx(
            SliderThumb.SliderThumb,
            {
              ...attributes?.SliderThumb,
              "aria-label": props["aria-label"]
            }
          ),
          kind === "range" && /* @__PURE__ */ jsxRuntime.jsx(
            SliderThumb.SliderThumb,
            {
              ...attributes?.SliderThumb,
              "aria-label": props["aria-label"]
            }
          ),
          stepPosition !== "none" && /* @__PURE__ */ jsxRuntime.jsx(
            SliderSteps.SliderSteps,
            {
              position: stepPosition,
              stepInterval,
              stepFormatFn,
              customSteps,
              ...attributes?.SliderSteps
            }
          )
        ]
      }
    );
  }
);
Slider.displayName = "Slider";

exports.Slider = Slider;
