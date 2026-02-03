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

const verticalNavSubList = cva("nv-vertical-nav-sub-list");
const VerticalNavSubList = forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    Primitive.ul,
    {
      ...mergeProps(
        {
          className: verticalNavSubList({ className }),
          ref,
          "data-testid": VerticalNavTestIds.VerticalNavSubList
        },
        props
      )
    }
  );
});
VerticalNavSubList.displayName = "VerticalNavSubList";

export { VerticalNavSubList };
