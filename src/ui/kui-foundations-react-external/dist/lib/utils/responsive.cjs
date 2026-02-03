/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var variants = require('./variants.cjs');

function getResponsiveClassName(base, variant, responsiveValue, defaultValue) {
  if (responsiveValue == null) {
    if (defaultValue == null) return void 0;
    responsiveValue = defaultValue;
  }
  if (typeof responsiveValue !== "object") {
    return variants.getVariantClassName(base, variant, responsiveValue);
  }
  const entries = Object.entries(responsiveValue);
  if (entries.length === 0) return void 0;
  const classes = new Array(entries.length);
  for (let i = 0; i < entries.length; i++) {
    const [k, v] = entries[i];
    classes[i] = variants.getVariantClassName(
      base,
      variant,
      v,
      k === "base" ? void 0 : k
    );
  }
  return classes.join(" ");
}

exports.getResponsiveClassName = getResponsiveClassName;
