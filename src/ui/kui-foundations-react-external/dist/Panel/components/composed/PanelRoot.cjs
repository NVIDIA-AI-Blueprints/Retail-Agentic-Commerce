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
var classVarianceAuthority = require('class-variance-authority');
var primitive = require('../../../lib/components/primitive.cjs');
var density = require('../../../lib/constants/density.cjs');
var constants = require('../../constants.cjs');

const panelRoot = classVarianceAuthority.cva("nv-panel", {
  variants: {
    density: density.densityVariant,
    elevation: {
      high: "nv-panel--elevation-high",
      higher: "nv-panel--elevation-higher",
      mid: "",
      low: "nv-panel--elevation-low"
    }
  },
  defaultVariants: {
    elevation: "mid"
  }
});
const PanelRoot = react.forwardRef(
  ({ className, density, elevation, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.div,
      {
        className: panelRoot({ className, density, elevation }),
        ref,
        "data-testid": constants.PanelTestIds.PanelRoot,
        ...props
      }
    );
  }
);
PanelRoot.displayName = "PanelRoot";

exports.PanelRoot = PanelRoot;
exports.panelRoot = panelRoot;
