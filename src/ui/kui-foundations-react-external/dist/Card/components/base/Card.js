/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { Slottable } from '../../../lib/components/Slottable.js';
import { CardContent } from '../composed/CardContent.js';
import { CardMedia } from '../composed/CardMedia.js';
import { CardRoot } from '../composed/CardRoot.js';

const Card = forwardRef(
  ({ asChild, children, slotHeader, slotMedia, attributes, ...props }, ref) => {
    return /* @__PURE__ */ jsx(CardRoot, { asChild, ref, ...props, children: /* @__PURE__ */ jsx(Slottable, { asChild, child: children, children: (child) => /* @__PURE__ */ jsxs(Fragment, { children: [
      slotMedia && /* @__PURE__ */ jsx(CardMedia, { slotHeader, ...attributes?.CardMedia, children: slotMedia }),
      /* @__PURE__ */ jsxs(CardContent, { ...attributes?.CardContent, children: [
        !slotMedia && slotHeader,
        child
      ] })
    ] }) }) });
  }
);
Card.displayName = "Card";

export { Card };
