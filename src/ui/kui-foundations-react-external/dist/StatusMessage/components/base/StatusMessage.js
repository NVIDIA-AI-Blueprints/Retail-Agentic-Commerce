/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsxs, jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { StatusMessageFooter } from '../composed/StatusMessageFooter.js';
import { StatusMessageHeader } from '../composed/StatusMessageHeader.js';
import { StatusMessageHeading } from '../composed/StatusMessageHeading.js';
import { StatusMessageMedia } from '../composed/StatusMessageMedia.js';
import { StatusMessageRoot } from '../composed/StatusMessageRoot.js';
import { StatusMessageSubheading } from '../composed/StatusMessageSubheading.js';

const StatusMessage = forwardRef(
  ({
    slotMedia,
    slotHeading,
    slotSubheading,
    slotFooter,
    attributes,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsxs(StatusMessageRoot, { ref, ...props, children: [
      slotMedia && /* @__PURE__ */ jsx(StatusMessageMedia, { ...attributes?.StatusMessageMedia, children: slotMedia }),
      /* @__PURE__ */ jsxs(StatusMessageHeader, { ...attributes?.StatusMessageHeader, children: [
        /* @__PURE__ */ jsx(StatusMessageHeading, { ...attributes?.StatusMessageHeading, children: slotHeading }),
        slotSubheading && /* @__PURE__ */ jsx(StatusMessageSubheading, { ...attributes?.StatusMessageSubheading, children: slotSubheading })
      ] }),
      slotFooter && /* @__PURE__ */ jsx(StatusMessageFooter, { ...attributes?.StatusMessageFooter, children: slotFooter })
    ] });
  }
);
StatusMessage.displayName = "StatusMessage";

export { StatusMessage };
