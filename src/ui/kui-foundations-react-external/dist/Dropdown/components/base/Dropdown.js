/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx, jsxs } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef, useCallback } from 'react';
import { Divider } from '../../../Divider/index.js';
import { DropdownCheckboxItem } from '../composed/DropdownCheckboxItem.js';
import { DropdownContent } from '../composed/DropdownContent.js';
import { DropdownHeading } from '../composed/DropdownHeading.js';
import { DropdownItem } from '../composed/DropdownItem.js';
import { DropdownRadioGroup } from '../composed/DropdownRadioGroup.js';
import { DropdownRadioGroupItem } from '../composed/DropdownRadioGroupItem.js';
import { DropdownRoot } from '../composed/DropdownRoot.js';
import { DropdownSection } from '../composed/DropdownSection.js';
import { DropdownSub } from '../composed/DropdownSub.js';
import { DropdownSubContent } from '../composed/DropdownSubContent.js';
import { DropdownSubTrigger } from '../composed/DropdownSubTrigger.js';
import { DropdownTrigger } from '../composed/DropdownTrigger.js';

const Dropdown = forwardRef(
  ({
    density,
    items,
    onItemCheckedChange,
    onItemSelect,
    open,
    onOpenChange,
    defaultOpen,
    modal,
    size,
    attributes,
    align,
    side,
    onCloseAutoFocus,
    onEscapeKeyDown,
    onPointerDownOutside,
    onInteractOutside,
    portal,
    portalContainer,
    renderLink,
    forceMount,
    ...props
  }, ref) => {
    const renderItem = useCallback(
      (item, index) => {
        if (isDefaultItem(item)) {
          return /* @__PURE__ */ jsx(
            DropdownItem,
            {
              asChild: !!item.href,
              danger: item.danger,
              disabled: item.disabled,
              slotLeft: item.slotLeft,
              onSelect: (e) => {
                onItemSelect?.(e, item);
                item.onSelect?.(e);
              },
              ...item.attributes?.DropdownItem,
              children: item.href ? renderLink ? renderLink(item) : /* @__PURE__ */ jsx("a", { href: item.href, children: item.children }) : item.children
            },
            index
          );
        }
        if (isCheckboxItem(item)) {
          return /* @__PURE__ */ jsx(
            DropdownCheckboxItem,
            {
              onCheckedChange: (checked) => {
                onItemCheckedChange?.(item, checked);
                item.onCheckedChange?.(checked);
              },
              checked: item.checked,
              disabled: item.disabled,
              defaultChecked: item.defaultChecked,
              danger: item.danger,
              onSelect: (e) => {
                onItemSelect?.(e, item);
                item.onSelect?.(e);
              },
              ...item.attributes?.DropdownCheckboxItem,
              children: item.children
            },
            index
          );
        }
        if (isSubSection(item)) {
          return /* @__PURE__ */ jsxs(
            DropdownSub,
            {
              defaultOpen: item.defaultOpen,
              open: item.open,
              onOpenChange: item.onOpenChange,
              children: [
                /* @__PURE__ */ jsx(DropdownSubTrigger, { ...item.attributes?.DropdownSubTrigger, children: item.children }),
                /* @__PURE__ */ jsx(
                  DropdownSubContent,
                  {
                    forceMount: item.forceMount,
                    onPointerDownOutside: item.onPointerDownOutside,
                    onEscapeKeyDown: item.onEscapeKeyDown,
                    portal: item.portal,
                    portalContainer: item.portalContainer,
                    ...item.attributes?.DropdownSubContent,
                    children: item.items.map(
                      (subItem, i) => renderItem(subItem, i)
                    )
                  }
                )
              ]
            },
            index
          );
        }
        if (isSection(item)) {
          return /* @__PURE__ */ jsxs(DropdownSection, { ...item.attributes?.DropdownSection, children: [
            /* @__PURE__ */ jsx(DropdownHeading, { ...item.attributes?.DropdownHeading, children: item.slotHeading }),
            item.items.map(
              (sectionItem, i) => renderItem(sectionItem, i)
            )
          ] }, index);
        }
        if (isRadioGroup(item)) {
          return /* @__PURE__ */ jsxs(
            DropdownRadioGroup,
            {
              name: item.name,
              defaultValue: item.defaultValue,
              value: item.value,
              onValueChange: item.onValueChange,
              disabled: item.disabled,
              required: item.required,
              error: item.error,
              ...item.attributes?.DropdownRadioGroup,
              children: [
                /* @__PURE__ */ jsx(DropdownHeading, { ...item.attributes?.DropdownHeading, children: item.slotHeading }),
                item.items.map((radioItem, i) => /* @__PURE__ */ jsx(
                  DropdownRadioGroupItem,
                  {
                    value: radioItem.value,
                    disabled: radioItem.disabled,
                    onSelect: (e) => {
                      onItemSelect?.(e, radioItem);
                      radioItem.onSelect?.(e);
                      item.onValueChange?.(radioItem.value);
                    },
                    ...radioItem.attributes?.DropdownRadioGroupItem,
                    children: radioItem.children
                  },
                  `${radioItem.value}-${i}`
                ))
              ]
            },
            `${item.name}-${index}`
          );
        }
        if (isDividerItem(item)) {
          return /* @__PURE__ */ jsx(
            Divider,
            {
              orientation: "horizontal",
              width: item.width,
              ...item.attributes?.Divider
            },
            `divider-${index}`
          );
        }
      },
      [onItemCheckedChange, onItemSelect, renderLink]
    );
    return /* @__PURE__ */ jsxs(
      DropdownRoot,
      {
        open,
        onOpenChange,
        defaultOpen,
        modal,
        size,
        children: [
          /* @__PURE__ */ jsx(DropdownTrigger, { ...props, ref }),
          /* @__PURE__ */ jsx(
            DropdownContent,
            {
              density,
              forceMount,
              portal,
              portalContainer,
              onCloseAutoFocus,
              onEscapeKeyDown,
              onPointerDownOutside,
              onInteractOutside,
              align,
              side,
              ...attributes?.DropdownContent,
              children: items.map((item, index) => renderItem(item, index))
            }
          )
        ]
      }
    );
  }
);
Dropdown.displayName = "Dropdown";
const isDefaultItem = (item) => item.kind === "default" || item.kind === void 0 && !("slotHeading" in item);
const isCheckboxItem = (item) => item.kind === "checkbox";
const isRadioGroup = (item) => item.kind === "radio";
const isSection = (item) => item.kind === void 0 && "slotHeading" in item;
const isSubSection = (item) => item.kind === "sub";
const isDividerItem = (item) => item.kind === "divider";

export { Dropdown };
