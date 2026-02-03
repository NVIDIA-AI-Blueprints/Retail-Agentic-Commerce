/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsxs, jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { HeroBody } from '../composed/HeroBody.js';
import { HeroContent } from '../composed/HeroContent.js';
import { HeroFooter } from '../composed/HeroFooter.js';
import { HeroHeading } from '../composed/HeroHeading.js';
import { HeroMedia } from '../composed/HeroMedia.js';
import { HeroRoot } from '../composed/HeroRoot.js';
import { HeroSubheading } from '../composed/HeroSubheading.js';

const Hero = forwardRef(
  ({
    slotMedia,
    slotHeading,
    slotSubheading,
    slotBody,
    slotActions,
    attributes,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsxs(HeroRoot, { ref, ...props, children: [
      /* @__PURE__ */ jsx(HeroMedia, { asChild: true, ...attributes?.HeroMedia, children: slotMedia }),
      /* @__PURE__ */ jsxs(HeroContent, { ...attributes?.HeroContent, children: [
        slotSubheading && /* @__PURE__ */ jsx(HeroSubheading, { ...attributes?.HeroSubheading, children: slotSubheading }),
        /* @__PURE__ */ jsx(HeroHeading, { ...attributes?.HeroHeading, children: slotHeading }),
        /* @__PURE__ */ jsx(HeroBody, { ...attributes?.HeroBody, children: slotBody }),
        slotActions && /* @__PURE__ */ jsx(HeroFooter, { ...attributes?.HeroFooter, children: slotActions })
      ] })
    ] });
  }
);
Hero.displayName = "Hero";

export { Hero };
