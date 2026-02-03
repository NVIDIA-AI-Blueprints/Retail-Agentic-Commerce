/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

function mergeProps(baseProps, overrideProps) {
  if (!overrideProps) return baseProps;
  const finalProps = { ...baseProps };
  Object.assign(finalProps, overrideProps);
  if ("style" in overrideProps && overrideProps.style) {
    const mergedStyle = {
      ...baseProps.style,
      ...overrideProps.style
    };
    finalProps.style = mergedStyle;
  }
  if ("className" in overrideProps && overrideProps.className) {
    const baseClassName = baseProps.className;
    const mergedClassName = baseClassName ? `${baseClassName} ${overrideProps.className}` : overrideProps.className;
    finalProps.className = mergedClassName;
  }
  return finalProps;
}

export { mergeProps };
