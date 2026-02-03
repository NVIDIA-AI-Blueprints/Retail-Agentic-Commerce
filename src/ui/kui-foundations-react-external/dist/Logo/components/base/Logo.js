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
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { LogoTestIds } from '../../constants.js';
import { HorizontalLogo } from '../composed/HorizontalLogo.js';
import { LogoOnlyLogo } from '../composed/LogoOnlyLogo.js';
import { VerticalLogo } from '../composed/VerticalLogo.js';

const logo = cva("nv-logo", {
  variants: {
    color: {
      brand: "",
      neutral: "nv-logo--color-neutral"
    },
    size: {
      small: "nv-logo--size-small",
      medium: "nv-logo--size-medium",
      large: "nv-logo--size-large",
      xlarge: "nv-logo--size-xlarge",
      xxlarge: "nv-logo--size-xxlarge"
    }
  },
  defaultVariants: {
    color: "brand"
  }
});
const logoMap = {
  horizontal: HorizontalLogo,
  vertical: VerticalLogo,
  "logo-only": LogoOnlyLogo
};
const Logo = React.forwardRef(
  ({ color, kind = "horizontal", className, size, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "div",
      {
        ...mergeProps(
          {
            className: logo({ className, color, size }),
            ref,
            "data-testid": LogoTestIds.Root
          },
          props
        ),
        children: logoMap[kind] && React.createElement(logoMap[kind], {
          className: "nv-logo-element",
          "data-testid": LogoTestIds.Logo
        })
      }
    );
  }
);
Logo.displayName = "Logo";

export { Logo, logoMap };
