/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
var classVarianceAuthority = require('class-variance-authority');
var Logo = require('../../../Logo/index.cjs');

function AppBarLogo({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      Logo.Logo,
      {
        className: classVarianceAuthority.cx("nv-app-bar-logo nv-app-bar-logo--sm-plus", className),
        kind: "horizontal",
        ...props
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      Logo.Logo,
      {
        className: classVarianceAuthority.cx("nv-app-bar-logo", className),
        kind: "logo-only",
        ...props
      }
    )
  ] });
}

exports.AppBarLogo = AppBarLogo;
