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
var Divider = require('../../../Divider/index.cjs');
var DropdownCheckboxItem = require('../composed/DropdownCheckboxItem.cjs');
var DropdownContent = require('../composed/DropdownContent.cjs');
var DropdownHeading = require('../composed/DropdownHeading.cjs');
var DropdownItem = require('../composed/DropdownItem.cjs');
var DropdownRadioGroup = require('../composed/DropdownRadioGroup.cjs');
var DropdownRadioGroupItem = require('../composed/DropdownRadioGroupItem.cjs');
var DropdownRoot = require('../composed/DropdownRoot.cjs');
var DropdownSection = require('../composed/DropdownSection.cjs');
var DropdownSub = require('../composed/DropdownSub.cjs');
var DropdownSubContent = require('../composed/DropdownSubContent.cjs');
var DropdownSubTrigger = require('../composed/DropdownSubTrigger.cjs');
var DropdownTrigger = require('../composed/DropdownTrigger.cjs');

const Dropdown = react.forwardRef(
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
    const renderItem = react.useCallback(
      (item, index) => {
        if (isDefaultItem(item)) {
          return /* @__PURE__ */ jsxRuntime.jsx(
            DropdownItem.DropdownItem,
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
              children: item.href ? renderLink ? renderLink(item) : /* @__PURE__ */ jsxRuntime.jsx("a", { href: item.href, children: item.children }) : item.children
            },
            index
          );
        }
        if (isCheckboxItem(item)) {
          return /* @__PURE__ */ jsxRuntime.jsx(
            DropdownCheckboxItem.DropdownCheckboxItem,
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
          return /* @__PURE__ */ jsxRuntime.jsxs(
            DropdownSub.DropdownSub,
            {
              defaultOpen: item.defaultOpen,
              open: item.open,
              onOpenChange: item.onOpenChange,
              children: [
                /* @__PURE__ */ jsxRuntime.jsx(DropdownSubTrigger.DropdownSubTrigger, { ...item.attributes?.DropdownSubTrigger, children: item.children }),
                /* @__PURE__ */ jsxRuntime.jsx(
                  DropdownSubContent.DropdownSubContent,
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
          return /* @__PURE__ */ jsxRuntime.jsxs(DropdownSection.DropdownSection, { ...item.attributes?.DropdownSection, children: [
            /* @__PURE__ */ jsxRuntime.jsx(DropdownHeading.DropdownHeading, { ...item.attributes?.DropdownHeading, children: item.slotHeading }),
            item.items.map(
              (sectionItem, i) => renderItem(sectionItem, i)
            )
          ] }, index);
        }
        if (isRadioGroup(item)) {
          return /* @__PURE__ */ jsxRuntime.jsxs(
            DropdownRadioGroup.DropdownRadioGroup,
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
                /* @__PURE__ */ jsxRuntime.jsx(DropdownHeading.DropdownHeading, { ...item.attributes?.DropdownHeading, children: item.slotHeading }),
                item.items.map((radioItem, i) => /* @__PURE__ */ jsxRuntime.jsx(
                  DropdownRadioGroupItem.DropdownRadioGroupItem,
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
      [onItemCheckedChange, onItemSelect, renderLink]
    );
    return /* @__PURE__ */ jsxRuntime.jsxs(
      DropdownRoot.DropdownRoot,
      {
        open,
        onOpenChange,
        defaultOpen,
        modal,
        size,
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(DropdownTrigger.DropdownTrigger, { ...props, ref }),
          /* @__PURE__ */ jsxRuntime.jsx(
            DropdownContent.DropdownContent,
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

exports.Dropdown = Dropdown;
