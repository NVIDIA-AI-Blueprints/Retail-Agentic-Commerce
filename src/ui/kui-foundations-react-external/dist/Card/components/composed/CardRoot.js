/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import React from 'react';
import { cva } from 'class-variance-authority';
import { Primitive } from '../../../lib/components/primitive.js';
import { densityVariant } from '../../../lib/constants/density.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { CardTestIds } from '../../constants.js';

const cardRoot = cva("nv-card-root", {
  variants: {
    density: densityVariant,
    interactive: {
      true: "nv-card-root--interactive"
    },
    kind: {
      solid: "nv-card-root--kind-solid",
      gradient: "nv-card-root--kind-gradient",
      float: "nv-card-root--kind-float"
    },
    layout: {
      horizontal: "nv-card-root--layout-horizontal",
      vertical: "nv-card-root--layout-vertical"
    },
    selected: {
      true: "nv-card-root--selected"
    }
  },
  defaultVariants: {
    interactive: false,
    kind: "solid",
    layout: "vertical",
    selected: false
  }
});
const CardRoot = React.forwardRef(
  ({ className, interactive, kind, layout, selected, density, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      Primitive.div,
      {
        ...mergeProps(
          {
            className: cardRoot({
              className,
              density,
              interactive,
              layout,
              kind,
              selected
            }),
            "data-testid": CardTestIds.CardRoot,
            ref
          },
          props
        )
      }
    );
  }
);
CardRoot.displayName = "CardRoot";

export { CardRoot };
