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

const verticalNavSubLink = cva("nv-vertical-nav-sub-link", {
  variants: {
    active: {
      true: "nv-vertical-nav-sub-link--active"
    },
    disabled: {
      true: "nv-vertical-nav-sub-link--disabled"
    }
  },
  defaultVariants: {
    active: false,
    disabled: false
  },
  compoundVariants: [
    {
      active: true,
      disabled: true,
      className: "nv-vertical-nav-sub-link--disabled"
    }
  ]
});
const VerticalNavSubLink = forwardRef(({ className, active, disabled, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    Primitive.a,
    {
      ...mergeProps(
        {
          className: verticalNavSubLink({ className, active, disabled }),
          ref,
          "data-testid": VerticalNavTestIds.VerticalNavSubLink,
          "aria-disabled": disabled,
          tabIndex: disabled ? -1 : void 0
        },
        props
      )
    }
  );
});
VerticalNavSubLink.displayName = "VerticalNavSubLink";

export { VerticalNavSubLink };
