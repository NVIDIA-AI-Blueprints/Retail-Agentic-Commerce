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
var classVarianceAuthority = require('class-variance-authority');
var TextInput = require('../../../TextInput/index.cjs');
var Icon = require('../../../lib/components/Icon.cjs');
var constants = require('../../constants.cjs');
var MenuSearchProvider = require('./MenuSearchProvider.cjs');

const menuSection = classVarianceAuthority.cva("nv-menu-search");
const MenuSearch = react.forwardRef(
  ({ className, placeholder = "Filter items", ...props }, ref) => {
    const ctx = MenuSearchProvider.useMenuSearchHandlers();
    return /* @__PURE__ */ jsxRuntime.jsx(
      TextInput.TextInput,
      {
        ref,
        role: "menuitem",
        slotLeft: /* @__PURE__ */ jsxRuntime.jsx(Icon.Icon, { name: "filter", variant: "fill" }),
        placeholder,
        className: menuSection({ className }),
        "data-testid": constants.MenuTestIds.MenuSearch,
        onValueChange: ctx?.setValue,
        ...props
      }
    );
  }
);
MenuSearch.displayName = "MenuSearch";

exports.MenuSearch = MenuSearch;
