/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsxs, jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { SliderRange } from '../composed/SliderRange.js';
import { SliderRoot } from '../composed/SliderRoot.js';
import { SliderSteps } from '../composed/SliderSteps.js';
import { SliderThumb } from '../composed/SliderThumb.js';
import { SliderTrack } from '../composed/SliderTrack.js';

const Slider = forwardRef(
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
    return /* @__PURE__ */ jsxs(
      SliderRoot,
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
          /* @__PURE__ */ jsx(SliderTrack, { ...attributes?.SliderTrack, children: /* @__PURE__ */ jsx(SliderRange, { ...attributes?.SliderRange }) }),
          /* @__PURE__ */ jsx(
            SliderThumb,
            {
              ...attributes?.SliderThumb,
              "aria-label": props["aria-label"]
            }
          ),
          kind === "range" && /* @__PURE__ */ jsx(
            SliderThumb,
            {
              ...attributes?.SliderThumb,
              "aria-label": props["aria-label"]
            }
          ),
          stepPosition !== "none" && /* @__PURE__ */ jsx(
            SliderSteps,
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

export { Slider };
