/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

const clamp = (value, [min, max]) => {
  return Math.min(max, Math.max(min, value));
};
const convertValueToPercentage = (value, min, max) => {
  const maxSteps = max - min;
  const percentPerStep = 100 / maxSteps;
  const percentage = percentPerStep * (value - min);
  return clamp(percentage, [0, 100]);
};
const linearScale = (input, output) => {
  return (value) => {
    if (input[0] === input[1] || output[0] === output[1]) return output[0];
    const ratio = (output[1] - output[0]) / (input[1] - input[0]);
    return output[0] + ratio * (value - input[0]);
  };
};
const getThumbInBoundsOffset = (width, left) => {
  const halfWidth = width / 2;
  const halfPercent = 50;
  const offset = linearScale([0, halfPercent], [0, halfWidth]);
  return (halfWidth - offset(left) * 1) * 1;
};
const getExactThumbPosition = (value, min, max, thumbSize = 0) => {
  const percent = convertValueToPercentage(value, min, max);
  const thumbInBoundsOffset = thumbSize ? getThumbInBoundsOffset(thumbSize, percent) : 0;
  return `calc(${percent}% + ${thumbInBoundsOffset}px)`;
};
const getStepPosition = (value, min, max, thumbSize = 0) => {
  if (thumbSize) {
    return getExactThumbPosition(value, min, max, thumbSize);
  }
  const percent = convertValueToPercentage(value, min, max);
  return `${percent}%`;
};
const getClosestStep = (value, min, max, step) => {
  const steps = [];
  for (let i = min; i <= max; i += step) {
    steps.push(i);
  }
  if (steps[steps.length - 1] !== max) {
    steps.push(max);
  }
  return steps.reduce((closest, current) => {
    return Math.abs(current - value) < Math.abs(closest - value) ? current : closest;
  });
};
const generateSteps = (min, max, step) => {
  const steps = [];
  for (let value = min; value <= max; value += step) {
    steps.push(value);
  }
  if (steps[steps.length - 1] !== max) {
    steps.push(max);
  }
  return steps;
};
const formatStep = (value, options = { maximumSignificantDigits: 2 }, locale = "en-US") => {
  return new Intl.NumberFormat(locale, options).format(value);
};
const getElementDimensions = (element) => {
  if (!element) return void 0;
  return {
    width: element.offsetWidth,
    height: element.offsetHeight
  };
};
const observeElementSize = (element, callback) => {
  if (!element || typeof ResizeObserver === "undefined") {
    return () => {
    };
  }
  const initialSize = getElementDimensions(element);
  if (initialSize) {
    callback(initialSize);
  }
  const resizeObserver = new ResizeObserver((entries) => {
    if (!Array.isArray(entries) || !entries.length) {
      return;
    }
    const entry = entries[0];
    let width;
    let height;
    if ("borderBoxSize" in entry) {
      const borderSizeEntry = entry["borderBoxSize"];
      const borderSize = Array.isArray(borderSizeEntry) ? borderSizeEntry[0] : borderSizeEntry;
      width = borderSize["inlineSize"];
      height = borderSize["blockSize"];
    } else {
      width = element.offsetWidth;
      height = element.offsetHeight;
    }
    callback({ width, height });
  });
  resizeObserver.observe(element, { box: "border-box" });
  return () => resizeObserver.unobserve(element);
};
const getAlignedStepPositionFromDimensions = (value, min, max, thumbDimensions, orientation = "horizontal") => {
  if (!thumbDimensions) {
    const percent = convertValueToPercentage(value, min, max);
    return `${percent}%`;
  }
  const thumbSize = orientation === "horizontal" ? thumbDimensions.width : thumbDimensions.height;
  return getExactThumbPosition(value, min, max, thumbSize);
};

exports.clamp = clamp;
exports.convertValueToPercentage = convertValueToPercentage;
exports.formatStep = formatStep;
exports.generateSteps = generateSteps;
exports.getAlignedStepPositionFromDimensions = getAlignedStepPositionFromDimensions;
exports.getClosestStep = getClosestStep;
exports.getElementDimensions = getElementDimensions;
exports.getExactThumbPosition = getExactThumbPosition;
exports.getStepPosition = getStepPosition;
exports.getThumbInBoundsOffset = getThumbInBoundsOffset;
exports.linearScale = linearScale;
exports.observeElementSize = observeElementSize;
