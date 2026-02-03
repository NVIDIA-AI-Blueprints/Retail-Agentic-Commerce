/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { Primitive } from '../../../lib/components/primitive.js';
import { densityVariant } from '../../../lib/constants/density.js';
import { PanelTestIds } from '../../constants.js';

const panelRoot = cva("nv-panel", {
  variants: {
    density: densityVariant,
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
const PanelRoot = forwardRef(
  ({ className, density, elevation, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      Primitive.div,
      {
        className: panelRoot({ className, density, elevation }),
        ref,
        "data-testid": PanelTestIds.PanelRoot,
        ...props
      }
    );
  }
);
PanelRoot.displayName = "PanelRoot";

export { PanelRoot, panelRoot };
