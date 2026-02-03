/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx, jsxs } from 'react/jsx-runtime';
import { forwardRef, useCallback } from 'react';
import { Divider } from '../../../Divider/index.js';
import { MenuCheckboxItem } from '../composed/MenuCheckboxItem.js';
import { MenuHeading } from '../composed/MenuHeading.js';
import { MenuItem } from '../composed/MenuItem.js';
import { MenuRadioGroup } from '../composed/MenuRadioGroup.js';
import { MenuRadioGroupItem } from '../composed/MenuRadioGroupItem.js';
import { MenuRoot } from '../composed/MenuRoot.js';
import { MenuSearch } from '../composed/MenuSearch.js';
import { MenuSearchProvider } from '../composed/MenuSearchProvider.js';
import { MenuSection } from '../composed/MenuSection.js';

const Menu = forwardRef(
  ({
    defaultFilterValue,
    filterable = false,
    items,
    filterMatchFn,
    filterValue,
    onFilterChange,
    onItemCheckedChange,
    onItemSelect,
    ...props
  }, ref) => {
    const renderItem = useCallback(
      (item, index) => {
        if (typeof item === "string") {
          return /* @__PURE__ */ jsx(
            MenuItem,
            {
              onSelect: (e) => {
                onItemSelect?.(e, { children: item, value: item });
              },
              children: item
            },
            `${item}-${index}`
          );
        }
        if (isDefaultItem(item)) {
          return /* @__PURE__ */ jsx(
            MenuItem,
            {
              slotLeft: item.slotLeft,
              slotRight: item.slotRight,
              disabled: item.disabled,
              danger: item.danger,
              onSelect: (e) => {
                onItemSelect?.(e, item);
                item.onSelect?.(e);
              },
              filterValue: item.filterValue,
              ...item.attributes?.MenuItem,
              children: item.children
            },
            index
          );
        }
        if (isCheckboxItem(item)) {
          return /* @__PURE__ */ jsx(
            MenuCheckboxItem,
            {
              onCheckedChange: (checked) => onItemCheckedChange?.(item, checked),
              checked: item.checked,
              onSelect: (e) => {
                onItemSelect?.(e, item);
                item.onSelect?.(e);
              },
              defaultChecked: item.defaultChecked,
              disabled: item.disabled,
              danger: item.danger,
              filterValue: item.filterValue,
              ...item.attributes?.MenuCheckboxItem,
              children: item.children
            },
            index
          );
        }
        if (isSection(item)) {
          return /* @__PURE__ */ jsxs(MenuSection, { ...item.attributes?.MenuSection, children: [
            /* @__PURE__ */ jsx(MenuHeading, { ...item.attributes?.MenuHeading, children: item.slotHeading }),
            item.items.map((sectionItem, i) => renderItem(sectionItem, i))
          ] }, index);
        }
        if (isRadioGroup(item)) {
          return /* @__PURE__ */ jsxs(
            MenuRadioGroup,
            {
              name: item.name,
              defaultValue: item.defaultValue,
              value: item.value,
              onValueChange: item.onValueChange,
              disabled: item.disabled,
              required: item.required,
              error: item.error,
              ...item.attributes?.MenuRadioGroup,
              children: [
                /* @__PURE__ */ jsx(MenuHeading, { ...item.attributes?.MenuHeading, children: item.slotHeading }),
                item.items.map((radioItem, i) => /* @__PURE__ */ jsx(
                  MenuRadioGroupItem,
                  {
                    value: radioItem.value,
                    danger: radioItem.danger,
                    disabled: radioItem.disabled,
                    filterValue: radioItem.filterValue,
                    onSelect: (e) => {
                      onItemSelect?.(e, radioItem);
                      radioItem.onSelect?.(e);
                    },
                    ...radioItem.attributes?.MenuRadioGroupItem,
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
      [onItemCheckedChange, onItemSelect]
    );
    const renderedItems = items.map((item, index) => renderItem(item, index));
    return /* @__PURE__ */ jsx(MenuRoot, { ref, ...props, children: filterable ? /* @__PURE__ */ jsxs(
      MenuSearchProvider,
      {
        defaultValue: defaultFilterValue,
        matchFn: filterMatchFn,
        onValueChange: onFilterChange,
        value: filterValue,
        children: [
          /* @__PURE__ */ jsx(
            MenuSearch,
            {
              defaultValue: defaultFilterValue,
              ...props.attributes?.MenuSearch
            }
          ),
          renderedItems
        ]
      }
    ) : renderedItems });
  }
);
Menu.displayName = "Menu";
const isDefaultItem = (item) => typeof item !== "string" && (item.kind === "default" || item.kind === void 0 && !("slotHeading" in item));
const isCheckboxItem = (item) => typeof item !== "string" && item.kind === "checkbox";
const isRadioGroup = (item) => typeof item !== "string" && item.kind === "radio";
const isSection = (item) => typeof item !== "string" && item.kind === void 0 && "slotHeading" in item;
const isDividerItem = (item) => typeof item !== "string" && item.kind === "divider";

export { Menu };
