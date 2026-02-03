/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var BreadcrumbsItem = require('../composed/BreadcrumbsItem.cjs');
var BreadcrumbsRoot = require('../composed/BreadcrumbsRoot.cjs');
var BreadcrumbsSeparator = require('../composed/BreadcrumbsSeparator.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const Breadcrumbs = React__default.default.forwardRef(
  ({ items, slotSeparator, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(BreadcrumbsRoot.BreadcrumbsRoot, { ref, ...props, children: items.map((item, index) => /* @__PURE__ */ jsxRuntime.jsxs(React__default.default.Fragment, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        BreadcrumbsItem.BreadcrumbsItem,
        {
          asChild: !!(item.href && index < items.length - 1),
          active: index === items.length - 1,
          ...item.attributes?.BreadcrumbsItem,
          children: item.href ? index < items.length - 1 ? /* @__PURE__ */ jsxRuntime.jsx("a", { href: item.href, children: item.slotLabel }) : item.slotLabel : item.slotTrigger
        }
      ),
      index < items.length - 1 && /* @__PURE__ */ jsxRuntime.jsx(BreadcrumbsSeparator.BreadcrumbsSeparator, { ...item.attributes?.BreadcrumbsSeparator, children: slotSeparator })
    ] }, index)) });
  }
);
Breadcrumbs.displayName = "Breadcrumbs";

exports.Breadcrumbs = Breadcrumbs;
