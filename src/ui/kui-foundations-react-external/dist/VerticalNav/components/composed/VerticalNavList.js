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
import { VerticalNavTestIds } from '../../constants.js';

const verticalNavList = cva("nv-vertical-nav-list");
const VerticalNavList = forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    Primitive.ul,
    {
      ...mergeProps(
        {
          className: verticalNavList({ className }),
          ref,
          "data-testid": VerticalNavTestIds.VerticalNavList
        },
        props
      )
    }
  );
});
VerticalNavList.displayName = "VerticalNavList";

export { VerticalNavList };
