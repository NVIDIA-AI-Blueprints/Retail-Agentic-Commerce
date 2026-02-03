/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

// foundations-css import removed
var classVarianceAuthority = require('class-variance-authority');
var properties = require('../constants/properties.cjs');
var variants = require('../utils/variants.cjs');
var reactPrimitive = require('@radix-ui/react-primitive');

const DEPRECATED_SIZE_MAPPING = {
  xxs: "density-xxs",
  xs: "density-xs",
  sm: "density-sm",
  md: "density-md",
  lg: "density-lg",
  xl: "density-xl",
  "2xl": "density-2xl",
  "3xl": "density-3xl",
  "4xl": "density-4xl",
  "5xl": "density-5xl"
};
function supportDeprecatedSemanticSizes(size) {
  return DEPRECATED_SIZE_MAPPING[size] ?? size;
}
const primitiveClassName = classVarianceAuthority.cva("", {
  variants: {
    gap: variants.buildVariants("nv-primitive", "gap", properties.SizeValues),
    padding: variants.buildVariants("nv-primitive", "spacing", properties.SizeValues),
    paddingX: variants.buildVariants("nv-primitive", "spacing-x", properties.SizeValues),
    paddingY: variants.buildVariants("nv-primitive", "spacing-y", properties.SizeValues),
    paddingTop: variants.buildVariants("nv-primitive", "spacing-t", properties.SizeValues),
    paddingRight: variants.buildVariants("nv-primitive", "spacing-r", properties.SizeValues),
    paddingBottom: variants.buildVariants("nv-primitive", "spacing-b", properties.SizeValues),
    paddingLeft: variants.buildVariants("nv-primitive", "spacing-l", properties.SizeValues),
    // deprecated properties:
    spacing: variants.buildVariants(
      "nv-primitive",
      "spacing",
      properties.DeprecatedSizeValues,
      supportDeprecatedSemanticSizes
    ),
    spacingX: variants.buildVariants(
      "nv-primitive",
      "spacing-x",
      properties.DeprecatedSizeValues,
      supportDeprecatedSemanticSizes
    ),
    spacingY: variants.buildVariants(
      "nv-primitive",
      "spacing-y",
      properties.DeprecatedSizeValues,
      supportDeprecatedSemanticSizes
    ),
    spacingTop: variants.buildVariants(
      "nv-primitive",
      "spacing-t",
      properties.DeprecatedSizeValues,
      supportDeprecatedSemanticSizes
    ),
    spacingRight: variants.buildVariants(
      "nv-primitive",
      "spacing-r",
      properties.DeprecatedSizeValues,
      supportDeprecatedSemanticSizes
    ),
    spacingBottom: variants.buildVariants(
      "nv-primitive",
      "spacing-b",
      properties.DeprecatedSizeValues,
      supportDeprecatedSemanticSizes
    ),
    spacingLeft: variants.buildVariants(
      "nv-primitive",
      "spacing-l",
      properties.DeprecatedSizeValues,
      supportDeprecatedSemanticSizes
    )
  },
  defaultVariants: {}
});
const primitive = (args) => {
  if (!args || !args.gap) return primitiveClassName(args);
  return primitiveClassName({
    ...args,
    gap: supportDeprecatedSemanticSizes(args?.gap)
  });
};

Object.defineProperty(exports, "Primitive", {
  enumerable: true,
  get: function () { return reactPrimitive.Primitive; }
});
exports.primitive = primitive;
