/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx, jsxs } from 'react/jsx-runtime';
import React from 'react';
import { BreadcrumbsItem } from '../composed/BreadcrumbsItem.js';
import { BreadcrumbsRoot } from '../composed/BreadcrumbsRoot.js';
import { BreadcrumbsSeparator } from '../composed/BreadcrumbsSeparator.js';

const Breadcrumbs = React.forwardRef(
  ({ items, slotSeparator, ...props }, ref) => {
    return /* @__PURE__ */ jsx(BreadcrumbsRoot, { ref, ...props, children: items.map((item, index) => /* @__PURE__ */ jsxs(React.Fragment, { children: [
      /* @__PURE__ */ jsx(
        BreadcrumbsItem,
        {
          asChild: !!(item.href && index < items.length - 1),
          active: index === items.length - 1,
          ...item.attributes?.BreadcrumbsItem,
          children: item.href ? index < items.length - 1 ? /* @__PURE__ */ jsx("a", { href: item.href, children: item.slotLabel }) : item.slotLabel : item.slotTrigger
        }
      ),
      index < items.length - 1 && /* @__PURE__ */ jsx(BreadcrumbsSeparator, { ...item.attributes?.BreadcrumbsSeparator, children: slotSeparator })
    ] }, index)) });
  }
);
Breadcrumbs.displayName = "Breadcrumbs";

export { Breadcrumbs };
