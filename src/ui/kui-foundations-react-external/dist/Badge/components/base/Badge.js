/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { BadgeTestIds } from '../../constants.js';

const badge = cva("nv-badge", {
  variants: {
    kind: {
      outline: "",
      solid: "nv-badge--kind-solid"
    },
    color: {
      blue: "",
      green: "nv-badge--color-green",
      red: "nv-badge--color-red",
      yellow: "nv-badge--color-yellow",
      purple: "nv-badge--color-purple",
      teal: "nv-badge--color-teal",
      gray: "nv-badge--color-gray"
    }
  },
  defaultVariants: {
    kind: "outline",
    color: "blue"
  }
});
const Badge = forwardRef(
  ({ asChild, className, children, color, kind, type, ...props }, ref) => {
    const Component = asChild ? Slot : "span";
    return /* @__PURE__ */ jsx(
      Component,
      {
        ...mergeProps(
          {
            className: badge({
              className,
              kind: kind || (type === "bold" ? "solid" : type),
              color
            }),
            ref,
            "data-testid": BadgeTestIds.BadgeRoot
          },
          props
        ),
        children
      }
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
