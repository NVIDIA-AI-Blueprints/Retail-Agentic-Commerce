/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
// foundations-css import removed
import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { Slottable } from '../../../lib/components/Slottable.js';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { CardTestIds } from '../../constants.js';

const cardMedia = cva("nv-card-media");
const CardMedia = React.forwardRef(
  ({ children, className, slotHeader, asChild, ...props }, ref) => {
    const Component = asChild ? Slot : "div";
    return /* @__PURE__ */ jsx(
      Component,
      {
        ...mergeProps(
          {
            className: cardMedia({ className }),
            "data-testid": CardTestIds.CardMedia,
            ref
          },
          props
        ),
        children: /* @__PURE__ */ jsx(Slottable, { asChild, child: children, children: (child) => /* @__PURE__ */ jsxs(Fragment, { children: [
          child,
          slotHeader && /* @__PURE__ */ jsx(Primitive.div, { className: "nv-card-media-header", children: slotHeader })
        ] }) })
      }
    );
  }
);
CardMedia.displayName = "CardMedia";

export { CardMedia };
