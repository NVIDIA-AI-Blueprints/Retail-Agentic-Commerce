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

const verticalNavSubListItem = cva("nv-vertical-nav-sub-list-item");
const VerticalNavSubListItem = forwardRef(({ className, disabled, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    Primitive.li,
    {
      ...mergeProps(
        {
          className: verticalNavSubListItem({ className }),
          ref,
          "data-testid": VerticalNavTestIds.VerticalNavSubListItem,
          "aria-disabled": disabled,
          tabIndex: disabled ? -1 : void 0
        },
        props
      )
    }
  );
});
VerticalNavSubListItem.displayName = "VerticalNavSubListItem";

export { VerticalNavSubListItem };
