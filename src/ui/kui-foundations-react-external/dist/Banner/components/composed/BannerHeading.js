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
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { BannerTestIds } from '../../constants.js';

const bannerHeading = cva("nv-banner-heading");
const BannerHeading = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    Primitive.div,
    {
      ...mergeProps(
        {
          className: bannerHeading({ className }),
          "data-testid": BannerTestIds.BannerHeading,
          ref
        },
        props
      )
    }
  );
});
BannerHeading.displayName = "BannerHeading";

export { BannerHeading };
