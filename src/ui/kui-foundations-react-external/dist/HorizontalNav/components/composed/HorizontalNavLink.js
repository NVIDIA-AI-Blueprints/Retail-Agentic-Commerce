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
import { TabsTrigger } from '../../../Tabs/index.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { HorizontalNavTestIds } from '../../constants.js';

const horizontalNavLink = cva("nv-horizontal-nav-link");
const HorizontalNavLink = forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    TabsTrigger,
    {
      ...mergeProps(
        {
          className: horizontalNavLink({ className }),
          "data-testid": HorizontalNavTestIds.HorizontalNavLink,
          ref
        },
        props
      ),
      asChild: true
    }
  );
});
HorizontalNavLink.displayName = "HorizontalNavLink";

export { HorizontalNavLink };
