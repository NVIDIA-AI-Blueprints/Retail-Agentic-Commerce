/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var properties = require('./properties.cjs');

const PrimitiveArgTypes = {
  gap: {
    type: "string",
    control: "select",
    options: [void 0, ...properties.SizeValues]
  },
  padding: {
    type: "string",
    control: "select",
    options: [void 0, ...properties.SizeValues]
  },
  paddingX: {
    type: "string",
    control: "select",
    options: [void 0, ...properties.SizeValues]
  },
  paddingY: {
    type: "string",
    control: "select",
    options: [void 0, ...properties.SizeValues]
  },
  paddingTop: {
    type: "string",
    control: "select",
    options: [void 0, ...properties.SizeValues]
  },
  paddingRight: {
    type: "string",
    control: "select",
    options: [void 0, ...properties.SizeValues]
  },
  paddingBottom: {
    type: "string",
    control: "select",
    options: [void 0, ...properties.SizeValues]
  },
  paddingLeft: {
    type: "string",
    control: "select",
    options: [void 0, ...properties.SizeValues]
  },
  spacing: {
    type: "string",
    control: "select",
    options: [void 0, ...properties.DeprecatedSizeValues]
  },
  spacingX: {
    type: "string",
    control: "select",
    options: [void 0, ...properties.DeprecatedSizeValues]
  },
  spacingY: {
    type: "string",
    control: "select",
    options: [void 0, ...properties.DeprecatedSizeValues]
  },
  spacingTop: {
    type: "string",
    control: "select",
    options: [void 0, ...properties.DeprecatedSizeValues]
  },
  spacingRight: {
    type: "string",
    control: "select",
    options: [void 0, ...properties.DeprecatedSizeValues]
  },
  spacingBottom: {
    type: "string",
    control: "select",
    options: [void 0, ...properties.DeprecatedSizeValues]
  },
  spacingLeft: {
    type: "string",
    control: "select",
    options: [void 0, ...properties.DeprecatedSizeValues]
  }
};

exports.PrimitiveArgTypes = PrimitiveArgTypes;
