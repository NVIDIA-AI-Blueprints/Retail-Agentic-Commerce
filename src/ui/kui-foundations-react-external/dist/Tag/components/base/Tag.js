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
import { densityVariant } from '../../../lib/constants/density.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { TagTestIds } from '../../constants.js';

const tagRoot = cva("nv-tag", {
  variants: {
    color: {
      blue: "",
      gray: "nv-tag--color-gray",
      green: "nv-tag--color-green",
      purple: "nv-tag--color-purple",
      red: "nv-tag--color-red",
      teal: "nv-tag--color-teal",
      yellow: "nv-tag--color-yellow"
    },
    density: densityVariant,
    kind: {
      outline: "nv-tag--kind-outline",
      solid: ""
    },
    selected: {
      true: "nv-tag--selected"
    }
  },
  defaultVariants: {
    color: "blue",
    kind: "solid"
  }
});
const Tag = forwardRef(
  ({ asChild, color, children, density, kind, readOnly, selected, ...props }, ref) => {
    const Component = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(
      Component,
      {
        ...mergeProps(
          {
            className: tagRoot({
              color,
              kind,
              selected,
              density
            }),
            "data-selected": selected,
            "data-testid": TagTestIds.TagRoot,
            readOnly,
            ref
          },
          props
        ),
        children
      }
    );
  }
);
Tag.displayName = "Tag";

export { Tag };
