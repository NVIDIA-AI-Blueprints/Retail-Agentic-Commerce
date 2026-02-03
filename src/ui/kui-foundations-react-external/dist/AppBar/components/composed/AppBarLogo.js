/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { cx } from 'class-variance-authority';
import { Logo } from '../../../Logo/index.js';

function AppBarLogo({ className, ...props }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      Logo,
      {
        className: cx("nv-app-bar-logo nv-app-bar-logo--sm-plus", className),
        kind: "horizontal",
        ...props
      }
    ),
    /* @__PURE__ */ jsx(
      Logo,
      {
        className: cx("nv-app-bar-logo", className),
        kind: "logo-only",
        ...props
      }
    )
  ] });
}

export { AppBarLogo };
