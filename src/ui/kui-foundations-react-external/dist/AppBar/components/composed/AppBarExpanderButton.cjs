/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
var react = require('react');
var Button = require('../../../Button/index.cjs');
var Icon = require('../../../lib/components/Icon.cjs');

const AppBarExpanderButton = react.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      Button.Button,
      {
        ref,
        "aria-label": "Expand",
        className: `nv-app-bar-expander-button ${className}`,
        kind: "tertiary",
        size: "small",
        ...props,
        children: /* @__PURE__ */ jsxRuntime.jsx(Icon.Icon, { name: "menu" })
      }
    );
  }
);
AppBarExpanderButton.displayName = "AppBarExpanderButton";

exports.AppBarExpanderButton = AppBarExpanderButton;
