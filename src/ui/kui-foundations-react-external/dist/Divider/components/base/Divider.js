/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { DividerElement } from '../composed/DividerElement.js';
import { DividerRoot } from '../composed/DividerRoot.js';

const Divider = forwardRef(
  ({
    className,
    padding,
    paddingX,
    paddingY,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    spacingX,
    spacingY,
    spacingTop,
    spacingRight,
    spacingBottom,
    spacingLeft,
    orientation,
    width,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsx(
      DividerRoot,
      {
        className,
        padding,
        paddingX,
        paddingY,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        spacingX,
        spacingY,
        spacingTop,
        spacingRight,
        spacingBottom,
        spacingLeft,
        orientation,
        ...props?.attributes?.DividerRoot,
        children: /* @__PURE__ */ jsx(
          DividerElement,
          {
            orientation,
            width,
            ...props,
            ref,
            ...props?.attributes?.DividerElement
          }
        )
      }
    );
  }
);
Divider.displayName = "Divider";

export { Divider };
