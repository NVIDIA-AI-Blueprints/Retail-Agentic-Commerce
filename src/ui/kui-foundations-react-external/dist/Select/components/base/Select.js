/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsxs, jsx } from 'react/jsx-runtime';
// foundations-css import removed
import React from 'react';
import { MenuSection, MenuHeading } from '../../../Menu/index.js';
import { useElementAttributes } from '../../../lib/hooks/use-element-attributes.js';
import { getSelectedItemValue, isSection } from '../../utils.js';
import { SelectContent } from '../composed/SelectContent.js';
import { SelectItem } from '../composed/SelectItem.js';
import { SelectRoot } from '../composed/SelectRoot.js';
import { SelectTrigger } from '../composed/SelectTrigger.js';

const renderEntry = (entry) => {
  if (isSection(entry)) {
    return /* @__PURE__ */ jsxs(
      MenuSection,
      {
        ...entry.attributes?.MenuSection,
        children: [
          /* @__PURE__ */ jsx(MenuHeading, { ...entry.attributes?.MenuHeading, children: entry.slotHeading }),
          entry.items.map((subEntry, idx) => /* @__PURE__ */ jsx(
            React.Fragment,
            {
              children: renderEntry(subEntry)
            },
            typeof subEntry === "string" ? subEntry : subEntry.value || idx
          ))
        ]
      },
      entry.slotHeading?.toString()
    );
  }
  if (typeof entry === "string") {
    return /* @__PURE__ */ jsx(SelectItem, { value: entry, children: entry }, entry);
  }
  return /* @__PURE__ */ jsx(
    SelectItem,
    {
      filterValue: entry.filterValue,
      value: entry.value,
      danger: entry.danger,
      disabled: entry.disabled,
      onSelect: entry.onSelect,
      slotRight: entry.slotRight,
      slotLeft: entry.slotLeft,
      ...entry.attributes?.SelectItem,
      children: entry.children
    },
    entry.value
  );
};
const Select = React.forwardRef(
  ({
    density,
    defaultOpen,
    defaultValue,
    disabled,
    renderValue,
    items,
    kind = "single",
    multiple,
    onOpenChange,
    onScrollToBottom,
    onValueChange,
    open,
    side,
    readOnly,
    size,
    value,
    attributes,
    autoFocusOnHide,
    hideOnEscape,
    portal,
    portalContainer,
    dismissible,
    slotRight,
    slotLeft,
    status,
    placeholder,
    required,
    triggerKind,
    ...props
  }, ref) => {
    const [triggerAttrs, contentAttrs] = useElementAttributes(
      props,
      ["button", SelectTrigger],
      ["menu", SelectContent]
    );
    const renderedItems = React.useMemo(() => {
      return items?.map((entry) => renderEntry(entry));
    }, [items]);
    const renderValueProp = React.useCallback(
      (value2) => {
        return getSelectedItemValue(
          value2,
          items
        );
      },
      [items]
    );
    return /* @__PURE__ */ jsxs(
      SelectRoot,
      {
        defaultOpen,
        defaultValue,
        disabled,
        multiple: multiple ?? kind === "multiple",
        onOpenChange,
        onValueChange,
        open,
        readOnly,
        side,
        size,
        value,
        children: [
          /* @__PURE__ */ jsx(
            SelectTrigger,
            {
              renderValue: renderValue ?? renderValueProp,
              kind: triggerKind,
              ref,
              dismissible,
              placeholder,
              required,
              slotRight,
              slotLeft,
              status,
              ...triggerAttrs,
              ...attributes?.SelectTrigger
            }
          ),
          /* @__PURE__ */ jsx(
            SelectContent,
            {
              autoFocusOnHide,
              density,
              hideOnEscape,
              onScrollToBottom,
              portal,
              portalContainer,
              ...contentAttrs,
              ...attributes?.SelectContent,
              children: renderedItems
            }
          )
        ]
      }
    );
  }
);
Select.displayName = "Select";

export { Select };
