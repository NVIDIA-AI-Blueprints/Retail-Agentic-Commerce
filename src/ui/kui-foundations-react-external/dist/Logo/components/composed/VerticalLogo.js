/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
import React from 'react';

const VerticalLogo = React.forwardRef(function VertialLogo(props, ref) {
  return /* @__PURE__ */ jsx("svg", { ...props, viewBox: "0 0 99 75", ref, children: /* @__PURE__ */ jsx(
    "path",
    {
      d: "",
      className: "nv-logo-text-path",
      fillRule: "evenodd"
    }
  ) });
});

export { VerticalLogo };
