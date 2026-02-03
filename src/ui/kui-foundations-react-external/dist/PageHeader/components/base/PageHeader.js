/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsxs, jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { PageHeaderContent } from '../composed/PageHeaderContent.js';
import { PageHeaderDescription } from '../composed/PageHeaderDescription.js';
import { PageHeaderFooter } from '../composed/PageHeaderFooter.js';
import { PageHeaderHeader } from '../composed/PageHeaderHeader.js';
import { PageHeaderHeading } from '../composed/PageHeaderHeading.js';
import { PageHeaderMain } from '../composed/PageHeaderMain.js';
import { PageHeaderRoot } from '../composed/PageHeaderRoot.js';
import { PageHeaderSubheading } from '../composed/PageHeaderSubheading.js';

const PageHeader = forwardRef(
  ({
    kind,
    children,
    slotActions,
    slotBreadcrumbs,
    slotDescription,
    slotHeading,
    slotSubheading,
    attributes,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsxs(PageHeaderRoot, { kind, ref, ...props, children: [
      /* @__PURE__ */ jsxs(PageHeaderContent, { ...attributes?.PageHeaderContent, children: [
        slotBreadcrumbs,
        /* @__PURE__ */ jsxs(PageHeaderHeader, { ...attributes?.PageHeaderHeader, children: [
          slotSubheading && /* @__PURE__ */ jsx(PageHeaderSubheading, { ...attributes?.PageHeaderSubheading, children: slotSubheading }),
          slotHeading && /* @__PURE__ */ jsx(PageHeaderHeading, { ...attributes?.PageHeaderHeading, children: slotHeading }),
          slotDescription && /* @__PURE__ */ jsx(PageHeaderDescription, { ...attributes?.PageHeaderDescription, children: slotDescription })
        ] }),
        children && /* @__PURE__ */ jsx(PageHeaderMain, { ...attributes?.PageHeaderMain, children })
      ] }),
      slotActions && /* @__PURE__ */ jsx(PageHeaderFooter, { ...attributes?.PageHeaderFooter, children: slotActions })
    ] });
  }
);
PageHeader.displayName = "PageHeader";

export { PageHeader };
