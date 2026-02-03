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

const verticalNavLink = cva("nv-vertical-nav-link", {
  variants: {
    active: {
      true: "nv-vertical-nav-link--active"
    },
    disabled: {
      true: "nv-vertical-nav-link--disabled"
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
      className: "nv-vertical-nav-link--disabled"
    }
  ]
});
const VerticalNavLink = forwardRef(({ className, active, disabled, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    Primitive.a,
    {
      ...mergeProps(
        {
          className: verticalNavLink({ className, active, disabled }),
          ref,
          "data-testid": VerticalNavTestIds.VerticalNavLink,
          "aria-disabled": disabled,
          tabIndex: disabled ? -1 : void 0
        },
        props
      )
    }
  );
});
VerticalNavLink.displayName = "VerticalNavLink";

export { VerticalNavLink };
