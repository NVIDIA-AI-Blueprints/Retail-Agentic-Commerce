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
var Anchor = require('../../../Anchor/index.cjs');
var HorizontalNavLink = require('../composed/HorizontalNavLink.cjs');
var HorizontalNavList = require('../composed/HorizontalNavList.cjs');
var HorizontalNavRoot = require('../composed/HorizontalNavRoot.cjs');

const HorizontalNav = react.forwardRef(
  ({
    items,
    renderLink = (item) => /* @__PURE__ */ jsxRuntime.jsx(Anchor.Anchor, { kind: "standalone", ...item }),
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(HorizontalNavRoot.HorizontalNavRoot, { ref, ...props, children: items.length > 0 && /* @__PURE__ */ jsxRuntime.jsx(HorizontalNavList.HorizontalNavList, { ...props.attributes?.HorizontalNavList, children: items.map((item) => /* @__PURE__ */ jsxRuntime.jsx(
      HorizontalNavLink.HorizontalNavLink,
      {
        value: item.value,
        disabled: item.disabled,
        ...props.attributes?.HorizontalNavLink,
        children: renderLink(item)
      },
      item.value
    )) }) });
  }
);
HorizontalNav.displayName = "HorizontalNav";

exports.HorizontalNav = HorizontalNav;
