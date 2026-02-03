/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var primitive = require('../../../lib/components/primitive.cjs');
var TabsContent = require('../composed/TabsContent.cjs');
var TabsList = require('../composed/TabsList.cjs');
var TabsRoot = require('../composed/TabsRoot.cjs');
var TabsTrigger = require('../composed/TabsTrigger.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const isTabLink = (item) => item.href !== void 0;
const Tabs = React.forwardRef(
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
    const InnerRoot = React__default.default.useMemo(
      () => items.some((item) => item.href) ? "nav" : "div",
      [items]
    );
    return /* @__PURE__ */ jsxRuntime.jsx(
      TabsRoot.TabsRoot,
      {
        ref,
        value,
        defaultValue,
        onValueChange,
        asChild: true,
        ...props,
        children: /* @__PURE__ */ jsxRuntime.jsxs(InnerRoot, { children: [
          items.length > 0 && /* @__PURE__ */ jsxRuntime.jsx(
            TabsList.TabsList,
            {
              kind,
              visibleRange,
              hideOverflowButtons,
              ...attributes?.TabsList,
              children: items.map((item) => /* @__PURE__ */ jsxRuntime.jsx(
                TabsTrigger.TabsTrigger,
                {
                  asChild: !!item.href || item.asChild,
                  value: item.value,
                  disabled: item.disabled,
                  ...item.attributes?.TabsTrigger,
                  children: isTabLink(item) ? renderLink ? renderLink(item) : /* @__PURE__ */ jsxRuntime.jsx(primitive.Primitive.a, { asChild: item.asChild, href: item.href, children: item.children ?? item.slotTrigger }) : item.children ?? item.slotTrigger
                },
                item.value
              ))
            }
          ),
          items.map(
            (item) => item.slotContent && /* @__PURE__ */ jsxRuntime.jsx(
              TabsContent.TabsContent,
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

exports.Tabs = Tabs;
