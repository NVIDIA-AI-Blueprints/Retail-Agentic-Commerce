/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

const getVariantClassName = (base, variant, value, screen) => {
  const className = `${base}--${variant}-${value}`;
  return screen ? `${screen}__${className}` : className;
};
const buildVariants = (base, variant, values, transform) => values.reduce(
  (map, value) => {
    const normalizedValue = value.toString().replace(".", "_");
    map[value] = `${base}--${variant}-${transform ? transform(normalizedValue) : normalizedValue}`;
    return map;
  },
  {}
);

exports.buildVariants = buildVariants;
exports.getVariantClassName = getVariantClassName;
