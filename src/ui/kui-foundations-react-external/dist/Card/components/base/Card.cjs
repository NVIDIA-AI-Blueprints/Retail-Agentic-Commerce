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
var Slottable = require('../../../lib/components/Slottable.cjs');
var CardContent = require('../composed/CardContent.cjs');
var CardMedia = require('../composed/CardMedia.cjs');
var CardRoot = require('../composed/CardRoot.cjs');

const Card = react.forwardRef(
  ({ asChild, children, slotHeader, slotMedia, attributes, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(CardRoot.CardRoot, { asChild, ref, ...props, children: /* @__PURE__ */ jsxRuntime.jsx(Slottable.Slottable, { asChild, child: children, children: (child) => /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
      slotMedia && /* @__PURE__ */ jsxRuntime.jsx(CardMedia.CardMedia, { slotHeader, ...attributes?.CardMedia, children: slotMedia }),
      /* @__PURE__ */ jsxRuntime.jsxs(CardContent.CardContent, { ...attributes?.CardContent, children: [
        !slotMedia && slotHeader,
        child
      ] })
    ] }) }) });
  }
);
Card.displayName = "Card";

exports.Card = Card;
