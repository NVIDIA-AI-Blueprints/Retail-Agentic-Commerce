/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
// foundations-css import removed
var AnimatedChevron = require('../../../AnimatedChevron/index.cjs');
var VerticalNavAccordionContent = require('../composed/VerticalNavAccordionContent.cjs');
var VerticalNavAccordionItem = require('../composed/VerticalNavAccordionItem.cjs');
var VerticalNavAccordionRoot = require('../composed/VerticalNavAccordionRoot.cjs');
var VerticalNavAccordionTrigger = require('../composed/VerticalNavAccordionTrigger.cjs');
var VerticalNavIcon = require('../composed/VerticalNavIcon.cjs');
var VerticalNavLink = require('../composed/VerticalNavLink.cjs');
var VerticalNavList = require('../composed/VerticalNavList.cjs');
var VerticalNavListItem = require('../composed/VerticalNavListItem.cjs');
var VerticalNavRoot = require('../composed/VerticalNavRoot.cjs');
var VerticalNavSubLink = require('../composed/VerticalNavSubLink.cjs');
var VerticalNavSubList = require('../composed/VerticalNavSubList.cjs');
var VerticalNavSubListItem = require('../composed/VerticalNavSubListItem.cjs');
var VerticalNavText = require('../composed/VerticalNavText.cjs');

const VerticalNav = ({
  attributes,
  items,
  renderLink = (item) => /* @__PURE__ */ jsxRuntime.jsxs(
    VerticalNavLink.VerticalNavLink,
    {
      href: item.href,
      active: item.active,
      disabled: item.disabled,
      ...item.attributes?.VerticalNavLink,
      children: [
        item.slotIcon && /* @__PURE__ */ jsxRuntime.jsx(VerticalNavIcon.VerticalNavIcon, { ...item.attributes?.VerticalNavIcon, children: item.slotIcon }),
        /* @__PURE__ */ jsxRuntime.jsx(VerticalNavText.VerticalNavText, { ...item.attributes?.VerticalNavText, children: item.slotLabel })
      ]
    }
  ),
  renderSubLink = (subItem, item) => {
    return /* @__PURE__ */ jsxRuntime.jsxs(
      VerticalNavSubLink.VerticalNavSubLink,
      {
        href: subItem.href,
        active: subItem.active,
        disabled: item?.disabled || subItem?.disabled,
        ...subItem.attributes?.VerticalNavSubLink,
        children: [
          subItem.slotIcon && /* @__PURE__ */ jsxRuntime.jsx(VerticalNavIcon.VerticalNavIcon, { ...subItem.attributes?.VerticalNavIcon, children: subItem.slotIcon }),
          /* @__PURE__ */ jsxRuntime.jsx(VerticalNavText.VerticalNavText, { ...subItem.attributes?.VerticalNavText, children: subItem.slotLabel })
        ]
      }
    );
  },
  ...props
}) => {
  return /* @__PURE__ */ jsxRuntime.jsx(VerticalNavRoot.VerticalNavRoot, { ...props, children: /* @__PURE__ */ jsxRuntime.jsx(VerticalNavList.VerticalNavList, { ...attributes?.VerticalNavList, children: items.map((item) => /* @__PURE__ */ jsxRuntime.jsx(
    VerticalNavListItem.VerticalNavListItem,
    {
      ...item.attributes?.VerticalNavListItem,
      children: item.subItems ? /* @__PURE__ */ jsxRuntime.jsx(
        VerticalNavAccordionRoot.VerticalNavAccordionRoot,
        {
          defaultValue: item.open !== void 0 ? void 0 : item.defaultOpen === false ? [] : [item.id],
          value: item.open !== void 0 ? item.open ? [item.id] : [] : void 0,
          onValueChange: item.onOpenChange !== void 0 ? (value) => item.onOpenChange?.(value.includes(item.id)) : void 0,
          disabled: item.disabled,
          ...item.attributes?.VerticalNavAccordionRoot,
          children: /* @__PURE__ */ jsxRuntime.jsxs(
            VerticalNavAccordionItem.VerticalNavAccordionItem,
            {
              value: item.id,
              disabled: item.disabled,
              ...item.attributes?.VerticalNavAccordionItem,
              children: [
                /* @__PURE__ */ jsxRuntime.jsxs(
                  VerticalNavAccordionTrigger.VerticalNavAccordionTrigger,
                  {
                    disabled: item.disabled,
                    ...item.attributes?.VerticalNavAccordionTrigger,
                    children: [
                      item.slotIcon && /* @__PURE__ */ jsxRuntime.jsx(VerticalNavIcon.VerticalNavIcon, { ...item.attributes?.VerticalNavIcon, children: item.slotIcon }),
                      /* @__PURE__ */ jsxRuntime.jsx(VerticalNavText.VerticalNavText, { ...item.attributes?.VerticalNavText, children: item.slotLabel }),
                      /* @__PURE__ */ jsxRuntime.jsx(VerticalNavIcon.VerticalNavIcon, { children: /* @__PURE__ */ jsxRuntime.jsx(AnimatedChevron.AnimatedChevron, {}) })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntime.jsx(
                  VerticalNavAccordionContent.VerticalNavAccordionContent,
                  {
                    disabled: item.disabled,
                    ...item.attributes?.VerticalNavAccordionContent,
                    children: /* @__PURE__ */ jsxRuntime.jsx(
                      VerticalNavSubList.VerticalNavSubList,
                      {
                        ...item.attributes?.VerticalNavSubList,
                        children: item.subItems?.map((subItem) => /* @__PURE__ */ jsxRuntime.jsx(
                          VerticalNavSubListItem.VerticalNavSubListItem,
                          {
                            disabled: item.disabled || subItem.disabled,
                            ...subItem.attributes?.VerticalNavSubListItem,
                            children: renderSubLink(subItem, item)
                          },
                          subItem.id
                        ))
                      }
                    )
                  }
                )
              ]
            }
          )
        }
      ) : renderLink(item)
    },
    item.id
  )) }) });
};
VerticalNav.displayName = "VerticalNav";

exports.VerticalNav = VerticalNav;
