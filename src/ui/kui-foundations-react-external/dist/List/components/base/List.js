/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx, jsxs } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { ListItem } from '../composed/ListItem.js';
import { ListItemMarker } from '../composed/ListItemMarker.js';
import { ListRoot } from '../composed/ListRoot.js';

const List = forwardRef(
  ({ kind = "unordered", items, attributes, ...props }, ref) => {
    return /* @__PURE__ */ jsx(ListRoot, { kind, ref, ...props, children: items.map((item, index) => {
      const itemToRender = typeof item === "string" ? { children: item } : item;
      return /* @__PURE__ */ jsxs(ListItem, { ...attributes?.ListItem, children: [
        /* @__PURE__ */ jsx(ListItemMarker, { ...attributes?.ListItemMarker, children: itemToRender.slotMarker ?? (kind === "ordered" ? `${index + 1}.` : void 0) }),
        itemToRender.children
      ] }, index);
    }) });
  }
);
List.displayName = "List";

export { List };
