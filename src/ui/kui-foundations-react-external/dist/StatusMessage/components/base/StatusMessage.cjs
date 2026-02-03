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
var StatusMessageFooter = require('../composed/StatusMessageFooter.cjs');
var StatusMessageHeader = require('../composed/StatusMessageHeader.cjs');
var StatusMessageHeading = require('../composed/StatusMessageHeading.cjs');
var StatusMessageMedia = require('../composed/StatusMessageMedia.cjs');
var StatusMessageRoot = require('../composed/StatusMessageRoot.cjs');
var StatusMessageSubheading = require('../composed/StatusMessageSubheading.cjs');

const StatusMessage = react.forwardRef(
  ({
    slotMedia,
    slotHeading,
    slotSubheading,
    slotFooter,
    attributes,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsxs(StatusMessageRoot.StatusMessageRoot, { ref, ...props, children: [
      slotMedia && /* @__PURE__ */ jsxRuntime.jsx(StatusMessageMedia.StatusMessageMedia, { ...attributes?.StatusMessageMedia, children: slotMedia }),
      /* @__PURE__ */ jsxRuntime.jsxs(StatusMessageHeader.StatusMessageHeader, { ...attributes?.StatusMessageHeader, children: [
        /* @__PURE__ */ jsxRuntime.jsx(StatusMessageHeading.StatusMessageHeading, { ...attributes?.StatusMessageHeading, children: slotHeading }),
        slotSubheading && /* @__PURE__ */ jsxRuntime.jsx(StatusMessageSubheading.StatusMessageSubheading, { ...attributes?.StatusMessageSubheading, children: slotSubheading })
      ] }),
      slotFooter && /* @__PURE__ */ jsxRuntime.jsx(StatusMessageFooter.StatusMessageFooter, { ...attributes?.StatusMessageFooter, children: slotFooter })
    ] });
  }
);
StatusMessage.displayName = "StatusMessage";

exports.StatusMessage = StatusMessage;
