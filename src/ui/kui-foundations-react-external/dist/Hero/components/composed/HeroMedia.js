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

const heroMedia = cva("nv-hero-media");
const HeroMedia = forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      Primitive.div,
      {
        ...mergeProps(
          {
            className: heroMedia({ className }),
            ref,
            "data-testid": HeroTestIds.HeroMedia
          },
          props
        )
      }
    );
  }
);
HeroMedia.displayName = "HeroMedia";

export { HeroMedia };
