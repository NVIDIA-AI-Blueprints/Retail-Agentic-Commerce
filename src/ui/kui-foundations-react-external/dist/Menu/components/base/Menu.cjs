/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
var react = require('react');
var Divider = require('../../../Divider/index.cjs');
var MenuCheckboxItem = require('../composed/MenuCheckboxItem.cjs');
var MenuHeading = require('../composed/MenuHeading.cjs');
var MenuItem = require('../composed/MenuItem.cjs');
var MenuRadioGroup = require('../composed/MenuRadioGroup.cjs');
var MenuRadioGroupItem = require('../composed/MenuRadioGroupItem.cjs');
var MenuRoot = require('../composed/MenuRoot.cjs');
var MenuSearch = require('../composed/MenuSearch.cjs');
var MenuSearchProvider = require('../composed/MenuSearchProvider.cjs');
var MenuSection = require('../composed/MenuSection.cjs');

const Menu = react.forwardRef(
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
    const renderItem = react.useCallback(
      (item, index) => {
        if (typeof item === "string") {
          return /* @__PURE__ */ jsxRuntime.jsx(
            MenuItem.MenuItem,
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
          return /* @__PURE__ */ jsxRuntime.jsx(
            MenuItem.MenuItem,
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
          return /* @__PURE__ */ jsxRuntime.jsx(
            MenuCheckboxItem.MenuCheckboxItem,
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
          return /* @__PURE__ */ jsxRuntime.jsxs(MenuSection.MenuSection, { ...item.attributes?.MenuSection, children: [
            /* @__PURE__ */ jsxRuntime.jsx(MenuHeading.MenuHeading, { ...item.attributes?.MenuHeading, children: item.slotHeading }),
            item.items.map((sectionItem, i) => renderItem(sectionItem, i))
          ] }, index);
        }
        if (isRadioGroup(item)) {
          return /* @__PURE__ */ jsxRuntime.jsxs(
            MenuRadioGroup.MenuRadioGroup,
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
                /* @__PURE__ */ jsxRuntime.jsx(MenuHeading.MenuHeading, { ...item.attributes?.MenuHeading, children: item.slotHeading }),
                item.items.map((radioItem, i) => /* @__PURE__ */ jsxRuntime.jsx(
                  MenuRadioGroupItem.MenuRadioGroupItem,
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
          return /* @__PURE__ */ jsxRuntime.jsx(
            Divider.Divider,
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
    return /* @__PURE__ */ jsxRuntime.jsx(MenuRoot.MenuRoot, { ref, ...props, children: filterable ? /* @__PURE__ */ jsxRuntime.jsxs(
      MenuSearchProvider.MenuSearchProvider,
      {
        defaultValue: defaultFilterValue,
        matchFn: filterMatchFn,
        onValueChange: onFilterChange,
        value: filterValue,
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            MenuSearch.MenuSearch,
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

exports.Menu = Menu;
