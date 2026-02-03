/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

// foundations-css import removed
import { cva } from 'class-variance-authority';
import { DeprecatedSizeValues, SizeValues } from '../constants/properties.js';
import { buildVariants } from '../utils/variants.js';
export { Primitive } from '@radix-ui/react-primitive';

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
const primitiveClassName = cva("", {
  variants: {
    gap: buildVariants("nv-primitive", "gap", SizeValues),
    padding: buildVariants("nv-primitive", "spacing", SizeValues),
    paddingX: buildVariants("nv-primitive", "spacing-x", SizeValues),
    paddingY: buildVariants("nv-primitive", "spacing-y", SizeValues),
    paddingTop: buildVariants("nv-primitive", "spacing-t", SizeValues),
    paddingRight: buildVariants("nv-primitive", "spacing-r", SizeValues),
    paddingBottom: buildVariants("nv-primitive", "spacing-b", SizeValues),
    paddingLeft: buildVariants("nv-primitive", "spacing-l", SizeValues),
    // deprecated properties:
    spacing: buildVariants(
      "nv-primitive",
      "spacing",
      DeprecatedSizeValues,
      supportDeprecatedSemanticSizes
    ),
    spacingX: buildVariants(
      "nv-primitive",
      "spacing-x",
      DeprecatedSizeValues,
      supportDeprecatedSemanticSizes
    ),
    spacingY: buildVariants(
      "nv-primitive",
      "spacing-y",
      DeprecatedSizeValues,
      supportDeprecatedSemanticSizes
    ),
    spacingTop: buildVariants(
      "nv-primitive",
      "spacing-t",
      DeprecatedSizeValues,
      supportDeprecatedSemanticSizes
    ),
    spacingRight: buildVariants(
      "nv-primitive",
      "spacing-r",
      DeprecatedSizeValues,
      supportDeprecatedSemanticSizes
    ),
    spacingBottom: buildVariants(
      "nv-primitive",
      "spacing-b",
      DeprecatedSizeValues,
      supportDeprecatedSemanticSizes
    ),
    spacingLeft: buildVariants(
      "nv-primitive",
      "spacing-l",
      DeprecatedSizeValues,
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

export { primitive };
