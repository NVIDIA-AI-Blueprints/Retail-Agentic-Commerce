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
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { HeroTestIds } from '../../constants.js';

const heroSubheading = cva("nv-hero-subheading");
const HeroSubheading = forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      Primitive.div,
      {
        ...mergeProps(
          {
            className: heroSubheading({ className }),
            ref,
            "data-testid": HeroTestIds.HeroSubheading
          },
          props
        )
      }
    );
  }
);
HeroSubheading.displayName = "HeroSubheading";

export { HeroSubheading };
