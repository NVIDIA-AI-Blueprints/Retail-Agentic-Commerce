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
import { TabsList } from '../../../Tabs/index.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { HorizontalNavTestIds } from '../../constants.js';

const horizontalNavList = cva("nv-horizontal-nav-list");
const HorizontalNavList = forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    TabsList,
    {
      ...mergeProps(
        {
          className: horizontalNavList({ className }),
          ref,
          "data-testid": HorizontalNavTestIds.HorizontalNavList,
          kind: "unstyled"
        },
        props
      )
    }
  );
});
HorizontalNavList.displayName = "HorizontalNavList";

export { HorizontalNavList };
