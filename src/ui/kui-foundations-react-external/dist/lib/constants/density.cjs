/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

const densityVariant = {
  compact: "nv-density-compact",
  standard: "nv-density-standard",
  spacious: "nv-density-spacious"
};
const getDensityFromSize = (size) => {
  if (size === "tiny" || size === "small") {
    return "compact";
  }
  if (size === "large") {
    return "spacious";
  }
  return void 0;
};

exports.densityVariant = densityVariant;
exports.getDensityFromSize = getDensityFromSize;
