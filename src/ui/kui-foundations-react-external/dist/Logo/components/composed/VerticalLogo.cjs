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

const VerticalLogo = React__default.default.forwardRef(function VertialLogo(props, ref) {
  return /* @__PURE__ */ jsxRuntime.jsx("svg", { ...props, viewBox: "0 0 99 75", ref, children: /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "",
      className: "nv-logo-text-path",
      fillRule: "evenodd"
    }
  ) });
});

exports.VerticalLogo = VerticalLogo;
