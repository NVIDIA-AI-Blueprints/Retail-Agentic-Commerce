/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
// foundations-css import removed
var react = require('react');
var DividerElement = require('../composed/DividerElement.cjs');
var DividerRoot = require('../composed/DividerRoot.cjs');

const Divider = react.forwardRef(
  ({
    className,
    padding,
    paddingX,
    paddingY,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    spacingX,
    spacingY,
    spacingTop,
    spacingRight,
    spacingBottom,
    spacingLeft,
    orientation,
    width,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      DividerRoot.DividerRoot,
      {
        className,
        padding,
        paddingX,
        paddingY,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        spacingX,
        spacingY,
        spacingTop,
        spacingRight,
        spacingBottom,
        spacingLeft,
        orientation,
        ...props?.attributes?.DividerRoot,
        children: /* @__PURE__ */ jsxRuntime.jsx(
          DividerElement.DividerElement,
          {
            orientation,
            width,
            ...props,
            ref,
            ...props?.attributes?.DividerElement
          }
        )
      }
    );
  }
);
Divider.displayName = "Divider";

exports.Divider = Divider;
