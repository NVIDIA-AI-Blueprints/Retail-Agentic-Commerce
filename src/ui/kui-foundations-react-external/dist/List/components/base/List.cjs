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
var ListItem = require('../composed/ListItem.cjs');
var ListItemMarker = require('../composed/ListItemMarker.cjs');
var ListRoot = require('../composed/ListRoot.cjs');

const List = react.forwardRef(
  ({ kind = "unordered", items, attributes, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(ListRoot.ListRoot, { kind, ref, ...props, children: items.map((item, index) => {
      const itemToRender = typeof item === "string" ? { children: item } : item;
      return /* @__PURE__ */ jsxRuntime.jsxs(ListItem.ListItem, { ...attributes?.ListItem, children: [
        /* @__PURE__ */ jsxRuntime.jsx(ListItemMarker.ListItemMarker, { ...attributes?.ListItemMarker, children: itemToRender.slotMarker ?? (kind === "ordered" ? `${index + 1}.` : void 0) }),
        itemToRender.children
      ] }, index);
    }) });
  }
);
List.displayName = "List";

exports.List = List;
