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
import { ButtonTestIds } from '../../constants.js';

const button = cva("nv-button", {
  variants: {
    size: {
      tiny: "nv-button--size-tiny",
      small: "nv-button--size-small",
      medium: "nv-button--size-medium",
      large: "nv-button--size-large"
    },
    kind: {
      primary: "nv-button--kind-primary",
      secondary: "nv-button--kind-secondary",
      tertiary: "nv-button--kind-tertiary"
    },
    color: {
      brand: "nv-button--color-brand",
      neutral: "nv-button--color-neutral",
      danger: "nv-button--color-danger"
    }
  }
});
const Button = React.forwardRef(
  ({ tone, className, kind, size, children, color, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      Primitive.button,
      {
        ...mergeProps(
          {
            className: button({
              className,
              kind: kind || tone,
              size,
              color
            }),
            ref,
            "data-testid": ButtonTestIds.Button
          },
          props
        ),
        children
      }
    );
  }
);
Button.displayName = "Button";

export { Button };
