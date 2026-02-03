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
var PageHeaderContent = require('../composed/PageHeaderContent.cjs');
var PageHeaderDescription = require('../composed/PageHeaderDescription.cjs');
var PageHeaderFooter = require('../composed/PageHeaderFooter.cjs');
var PageHeaderHeader = require('../composed/PageHeaderHeader.cjs');
var PageHeaderHeading = require('../composed/PageHeaderHeading.cjs');
var PageHeaderMain = require('../composed/PageHeaderMain.cjs');
var PageHeaderRoot = require('../composed/PageHeaderRoot.cjs');
var PageHeaderSubheading = require('../composed/PageHeaderSubheading.cjs');

const PageHeader = react.forwardRef(
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
    return /* @__PURE__ */ jsxRuntime.jsxs(PageHeaderRoot.PageHeaderRoot, { kind, ref, ...props, children: [
      /* @__PURE__ */ jsxRuntime.jsxs(PageHeaderContent.PageHeaderContent, { ...attributes?.PageHeaderContent, children: [
        slotBreadcrumbs,
        /* @__PURE__ */ jsxRuntime.jsxs(PageHeaderHeader.PageHeaderHeader, { ...attributes?.PageHeaderHeader, children: [
          slotSubheading && /* @__PURE__ */ jsxRuntime.jsx(PageHeaderSubheading.PageHeaderSubheading, { ...attributes?.PageHeaderSubheading, children: slotSubheading }),
          slotHeading && /* @__PURE__ */ jsxRuntime.jsx(PageHeaderHeading.PageHeaderHeading, { ...attributes?.PageHeaderHeading, children: slotHeading }),
          slotDescription && /* @__PURE__ */ jsxRuntime.jsx(PageHeaderDescription.PageHeaderDescription, { ...attributes?.PageHeaderDescription, children: slotDescription })
        ] }),
        children && /* @__PURE__ */ jsxRuntime.jsx(PageHeaderMain.PageHeaderMain, { ...attributes?.PageHeaderMain, children })
      ] }),
      slotActions && /* @__PURE__ */ jsxRuntime.jsx(PageHeaderFooter.PageHeaderFooter, { ...attributes?.PageHeaderFooter, children: slotActions })
    ] });
  }
);
PageHeader.displayName = "PageHeader";

exports.PageHeader = PageHeader;
