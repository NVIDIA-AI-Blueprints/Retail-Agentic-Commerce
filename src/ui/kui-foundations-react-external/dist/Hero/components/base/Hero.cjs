/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
// foundations-css import removed
var react = require('react');
var HeroBody = require('../composed/HeroBody.cjs');
var HeroContent = require('../composed/HeroContent.cjs');
var HeroFooter = require('../composed/HeroFooter.cjs');
var HeroHeading = require('../composed/HeroHeading.cjs');
var HeroMedia = require('../composed/HeroMedia.cjs');
var HeroRoot = require('../composed/HeroRoot.cjs');
var HeroSubheading = require('../composed/HeroSubheading.cjs');

const Hero = react.forwardRef(
  ({
    slotMedia,
    slotHeading,
    slotSubheading,
    slotBody,
    slotActions,
    attributes,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsxs(HeroRoot.HeroRoot, { ref, ...props, children: [
      /* @__PURE__ */ jsxRuntime.jsx(HeroMedia.HeroMedia, { asChild: true, ...attributes?.HeroMedia, children: slotMedia }),
      /* @__PURE__ */ jsxRuntime.jsxs(HeroContent.HeroContent, { ...attributes?.HeroContent, children: [
        slotSubheading && /* @__PURE__ */ jsxRuntime.jsx(HeroSubheading.HeroSubheading, { ...attributes?.HeroSubheading, children: slotSubheading }),
        /* @__PURE__ */ jsxRuntime.jsx(HeroHeading.HeroHeading, { ...attributes?.HeroHeading, children: slotHeading }),
        /* @__PURE__ */ jsxRuntime.jsx(HeroBody.HeroBody, { ...attributes?.HeroBody, children: slotBody }),
        slotActions && /* @__PURE__ */ jsxRuntime.jsx(HeroFooter.HeroFooter, { ...attributes?.HeroFooter, children: slotActions })
      ] })
    ] });
  }
);
Hero.displayName = "Hero";

exports.Hero = Hero;
