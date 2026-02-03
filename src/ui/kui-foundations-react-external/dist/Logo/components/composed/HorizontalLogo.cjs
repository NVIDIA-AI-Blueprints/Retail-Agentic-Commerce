/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const HorizontalLogo = React__default.default.forwardRef(function HorizontalLogo2(props, ref) {
  return /* @__PURE__ */ jsxRuntime.jsxs("svg", { ...props, viewBox: "0 0 164 30", ref, children: [
    /* @__PURE__ */ jsxRuntime.jsx("defs", { children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "" }) }),
    /* @__PURE__ */ jsxRuntime.jsxs("g", { fill: "none", fillRule: "evenodd", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "path",
        {
          d: "",
          className: "nv-logo-text-path",
          "data-description": "copyright"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        "path",
        {
          d: "",
          className: "nv-logo-text-path",
          "data-description": "nvidia text"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
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

exports.HorizontalLogo = HorizontalLogo;
