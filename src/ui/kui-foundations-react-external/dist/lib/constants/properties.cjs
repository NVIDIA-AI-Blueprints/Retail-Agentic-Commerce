/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var foundationsDesignTokens = require('@kui/foundations-design-tokens');

const ResponsiveVariants = ["sm", "md", "lg", "xl", "2xl"];
const AlignItemsValues = [
  "baseline",
  "center",
  "start",
  "end",
  "stretch"
];
const DirectionValues = [
  "row",
  "col",
  "row-reverse",
  "col-reverse"
];
const JustifyContentValues = [
  "normal",
  "start",
  "end",
  "center",
  "between",
  "around",
  "evenly",
  "stretch"
];
const FlexWrapValues = ["wrap", "nowrap", "wrap-reverse"];
const OverflowValues = [
  "auto",
  "clip",
  "hidden",
  "scroll",
  "visible"
];
const deprecatedSizeValues = [
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "5xl"
];
const DeprecatedSizeValues = Object.keys(foundationsDesignTokens.fixedSpacingScale).concat(
  deprecatedSizeValues
);
const SizeValues = Object.keys(foundationsDesignTokens.spacingScale);
const TextOverflowValues = ["ellipsis", "clip"];
const TextWrapValues = ["wrap", "nowrap", "balance", "pretty"];

exports.AlignItemsValues = AlignItemsValues;
exports.DeprecatedSizeValues = DeprecatedSizeValues;
exports.DirectionValues = DirectionValues;
exports.FlexWrapValues = FlexWrapValues;
exports.JustifyContentValues = JustifyContentValues;
exports.OverflowValues = OverflowValues;
exports.ResponsiveVariants = ResponsiveVariants;
exports.SizeValues = SizeValues;
exports.TextOverflowValues = TextOverflowValues;
exports.TextWrapValues = TextWrapValues;
