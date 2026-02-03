/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsxs, jsx } from 'react/jsx-runtime';
import React from 'react';

const HorizontalLogo = React.forwardRef(function HorizontalLogo2(props, ref) {
  return /* @__PURE__ */ jsxs("svg", { ...props, viewBox: "0 0 164 30", ref, children: [
    /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("path", { d: "" }) }),
    /* @__PURE__ */ jsxs("g", { fill: "none", fillRule: "evenodd", children: [
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "",
          className: "nv-logo-text-path",
          "data-description": "copyright"
        }
      ),
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "",
          className: "nv-logo-text-path",
          "data-description": "nvidia text"
        }
      ),
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "",
          className: "nv-logo-image-path",
          "data-description": "nvidia logo"
        }
      )
    ] })
  ] });
});

export { HorizontalLogo };
