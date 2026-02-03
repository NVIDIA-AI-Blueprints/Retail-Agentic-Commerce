/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx, jsxs } from 'react/jsx-runtime';
// foundations-css import removed
import { AnimatedChevron } from '../../../AnimatedChevron/index.js';
import { VerticalNavAccordionContent } from '../composed/VerticalNavAccordionContent.js';
import { VerticalNavAccordionItem } from '../composed/VerticalNavAccordionItem.js';
import { VerticalNavAccordionRoot } from '../composed/VerticalNavAccordionRoot.js';
import { VerticalNavAccordionTrigger } from '../composed/VerticalNavAccordionTrigger.js';
import { VerticalNavIcon } from '../composed/VerticalNavIcon.js';
import { VerticalNavLink } from '../composed/VerticalNavLink.js';
import { VerticalNavList } from '../composed/VerticalNavList.js';
import { VerticalNavListItem } from '../composed/VerticalNavListItem.js';
import { VerticalNavRoot } from '../composed/VerticalNavRoot.js';
import { VerticalNavSubLink } from '../composed/VerticalNavSubLink.js';
import { VerticalNavSubList } from '../composed/VerticalNavSubList.js';
import { VerticalNavSubListItem } from '../composed/VerticalNavSubListItem.js';
import { VerticalNavText } from '../composed/VerticalNavText.js';

const VerticalNav = ({
  attributes,
  items,
  renderLink = (item) => /* @__PURE__ */ jsxs(
    VerticalNavLink,
    {
      href: item.href,
      active: item.active,
      disabled: item.disabled,
      ...item.attributes?.VerticalNavLink,
      children: [
        item.slotIcon && /* @__PURE__ */ jsx(VerticalNavIcon, { ...item.attributes?.VerticalNavIcon, children: item.slotIcon }),
        /* @__PURE__ */ jsx(VerticalNavText, { ...item.attributes?.VerticalNavText, children: item.slotLabel })
      ]
    }
  ),
  renderSubLink = (subItem, item) => {
    return /* @__PURE__ */ jsxs(
      VerticalNavSubLink,
      {
        href: subItem.href,
        active: subItem.active,
        disabled: item?.disabled || subItem?.disabled,
        ...subItem.attributes?.VerticalNavSubLink,
        children: [
          subItem.slotIcon && /* @__PURE__ */ jsx(VerticalNavIcon, { ...subItem.attributes?.VerticalNavIcon, children: subItem.slotIcon }),
          /* @__PURE__ */ jsx(VerticalNavText, { ...subItem.attributes?.VerticalNavText, children: subItem.slotLabel })
        ]
      }
    );
  },
  ...props
}) => {
  return /* @__PURE__ */ jsx(VerticalNavRoot, { ...props, children: /* @__PURE__ */ jsx(VerticalNavList, { ...attributes?.VerticalNavList, children: items.map((item) => /* @__PURE__ */ jsx(
    VerticalNavListItem,
    {
      ...item.attributes?.VerticalNavListItem,
      children: item.subItems ? /* @__PURE__ */ jsx(
        VerticalNavAccordionRoot,
        {
          defaultValue: item.open !== void 0 ? void 0 : item.defaultOpen === false ? [] : [item.id],
          value: item.open !== void 0 ? item.open ? [item.id] : [] : void 0,
          onValueChange: item.onOpenChange !== void 0 ? (value) => item.onOpenChange?.(value.includes(item.id)) : void 0,
          disabled: item.disabled,
          ...item.attributes?.VerticalNavAccordionRoot,
          children: /* @__PURE__ */ jsxs(
            VerticalNavAccordionItem,
            {
              value: item.id,
              disabled: item.disabled,
              ...item.attributes?.VerticalNavAccordionItem,
              children: [
                /* @__PURE__ */ jsxs(
                  VerticalNavAccordionTrigger,
                  {
                    disabled: item.disabled,
                    ...item.attributes?.VerticalNavAccordionTrigger,
                    children: [
                      item.slotIcon && /* @__PURE__ */ jsx(VerticalNavIcon, { ...item.attributes?.VerticalNavIcon, children: item.slotIcon }),
                      /* @__PURE__ */ jsx(VerticalNavText, { ...item.attributes?.VerticalNavText, children: item.slotLabel }),
                      /* @__PURE__ */ jsx(VerticalNavIcon, { children: /* @__PURE__ */ jsx(AnimatedChevron, {}) })
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(
                  VerticalNavAccordionContent,
                  {
                    disabled: item.disabled,
                    ...item.attributes?.VerticalNavAccordionContent,
                    children: /* @__PURE__ */ jsx(
                      VerticalNavSubList,
                      {
                        ...item.attributes?.VerticalNavSubList,
                        children: item.subItems?.map((subItem) => /* @__PURE__ */ jsx(
                          VerticalNavSubListItem,
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

export { VerticalNav };
