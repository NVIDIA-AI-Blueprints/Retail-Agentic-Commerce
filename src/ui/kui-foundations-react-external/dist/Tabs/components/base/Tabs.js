/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx, jsxs } from 'react/jsx-runtime';
import React, { forwardRef } from 'react';
import { Primitive } from '../../../lib/components/primitive.js';
import { TabsContent } from '../composed/TabsContent.js';
import { TabsList } from '../composed/TabsList.js';
import { TabsRoot } from '../composed/TabsRoot.js';
import { TabsTrigger } from '../composed/TabsTrigger.js';

const isTabLink = (item) => item.href !== void 0;
const Tabs = forwardRef(
  ({
    items,
    kind = "primary",
    value,
    defaultValue = items[0]?.value,
    onValueChange,
    renderLink,
    attributes,
    visibleRange,
    hideOverflowButtons,
    ...props
  }, ref) => {
    const InnerRoot = React.useMemo(
      () => items.some((item) => item.href) ? "nav" : "div",
      [items]
    );
    return /* @__PURE__ */ jsx(
      TabsRoot,
      {
        ref,
        value,
        defaultValue,
        onValueChange,
        asChild: true,
        ...props,
        children: /* @__PURE__ */ jsxs(InnerRoot, { children: [
          items.length > 0 && /* @__PURE__ */ jsx(
            TabsList,
            {
              kind,
              visibleRange,
              hideOverflowButtons,
              ...attributes?.TabsList,
              children: items.map((item) => /* @__PURE__ */ jsx(
                TabsTrigger,
                {
                  asChild: !!item.href || item.asChild,
                  value: item.value,
                  disabled: item.disabled,
                  ...item.attributes?.TabsTrigger,
                  children: isTabLink(item) ? renderLink ? renderLink(item) : /* @__PURE__ */ jsx(Primitive.a, { asChild: item.asChild, href: item.href, children: item.children ?? item.slotTrigger }) : item.children ?? item.slotTrigger
                },
                item.value
              ))
            }
          ),
          items.map(
            (item) => item.slotContent && /* @__PURE__ */ jsx(
              TabsContent,
              {
                value: item.value,
                ...item.attributes?.TabsContent,
                children: item.slotContent
              },
              item.value
            )
          )
        ] })
      }
    );
  }
);
Tabs.displayName = "Tabs";

export { Tabs };
