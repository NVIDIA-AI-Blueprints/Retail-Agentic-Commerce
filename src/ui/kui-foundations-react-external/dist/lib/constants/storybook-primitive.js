/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { DeprecatedSizeValues, SizeValues } from './properties.js';

const PrimitiveArgTypes = {
  gap: {
    type: "string",
    control: "select",
    options: [void 0, ...SizeValues]
  },
  padding: {
    type: "string",
    control: "select",
    options: [void 0, ...SizeValues]
  },
  paddingX: {
    type: "string",
    control: "select",
    options: [void 0, ...SizeValues]
  },
  paddingY: {
    type: "string",
    control: "select",
    options: [void 0, ...SizeValues]
  },
  paddingTop: {
    type: "string",
    control: "select",
    options: [void 0, ...SizeValues]
  },
  paddingRight: {
    type: "string",
    control: "select",
    options: [void 0, ...SizeValues]
  },
  paddingBottom: {
    type: "string",
    control: "select",
    options: [void 0, ...SizeValues]
  },
  paddingLeft: {
    type: "string",
    control: "select",
    options: [void 0, ...SizeValues]
  },
  spacing: {
    type: "string",
    control: "select",
    options: [void 0, ...DeprecatedSizeValues]
  },
  spacingX: {
    type: "string",
    control: "select",
    options: [void 0, ...DeprecatedSizeValues]
  },
  spacingY: {
    type: "string",
    control: "select",
    options: [void 0, ...DeprecatedSizeValues]
  },
  spacingTop: {
    type: "string",
    control: "select",
    options: [void 0, ...DeprecatedSizeValues]
  },
  spacingRight: {
    type: "string",
    control: "select",
    options: [void 0, ...DeprecatedSizeValues]
  },
  spacingBottom: {
    type: "string",
    control: "select",
    options: [void 0, ...DeprecatedSizeValues]
  },
  spacingLeft: {
    type: "string",
    control: "select",
    options: [void 0, ...DeprecatedSizeValues]
  }
};

export { PrimitiveArgTypes };
