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
import { isSection } from '../../../Select/utils.js';
import { useElementAttributes } from '../../../lib/hooks/use-element-attributes.js';
import { ComboboxContent } from '../composed/ComboboxContent.js';
import { ComboboxInput } from '../composed/ComboboxInput.js';
import { ComboboxItem } from '../composed/ComboboxItem.js';
import { ComboboxRoot } from '../composed/ComboboxRoot.js';
import { ComboboxSearchProvider } from '../composed/ComboboxSearchProvider.js';
import { ComboboxSelectedValue } from '../composed/ComboboxSelectedValue.js';
import { ComboboxTrigger } from '../composed/ComboboxTrigger.js';

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
            typeof subEntry === "string" ? subEntry : subEntry.value || `index-${idx}`
          ))
        ]
      },
      entry.slotHeading?.toString()
    );
  }
  if (typeof entry === "string") {
    return /* @__PURE__ */ jsx(ComboboxItem, { filterValue: entry, value: entry, children: entry }, entry);
  }
  return /* @__PURE__ */ jsx(
    ComboboxItem,
    {
      filterValue: entry.filterValue,
      danger: entry.danger,
      disabled: entry.disabled,
      onSelect: entry.onSelect,
      value: entry.value,
      slotRight: entry.slotRight,
      slotLeft: entry.slotLeft,
      ...entry.attributes?.ComboboxItem,
      children: entry.children
    },
    entry.value
  );
};
const Combobox = React.forwardRef(
  ({
    className,
    density,
    defaultOpen,
    defaultSelectedValue,
    defaultValue,
    disabled,
    filterMatchFn,
    renderSelectedValue,
    items,
    multiple,
    kind = "single",
    onOpenChange,
    onScrollToBottom,
    onSelectedValueChange,
    onValueChange,
    open,
    side,
    readOnly,
    size,
    triggerKind,
    selectedValue,
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
    resetValueOnBlur,
    ...props
  }, ref) => {
    const [inputAttrs, contentAttrs] = useElementAttributes(
      props,
      ["input", ComboboxInput],
      ["menu", ComboboxContent]
    );
    const renderedItems = React.useMemo(() => {
      return items?.map((entry) => renderEntry(entry));
    }, [items]);
    return /* @__PURE__ */ jsxs(
      ComboboxRoot,
      {
        defaultOpen,
        defaultSelectedValue,
        defaultValue,
        disabled,
        multiple: multiple ?? kind === "multiple",
        onOpenChange,
        onSelectedValueChange,
        onValueChange,
        open,
        readOnly,
        selectedValue,
        side,
        size,
        value,
        withCustomValueRendering: !!renderSelectedValue,
        children: [
          /* @__PURE__ */ jsxs(
            ComboboxTrigger,
            {
              className,
              kind: triggerKind,
              ref,
              dismissible,
              slotRight,
              slotLeft,
              status,
              ...attributes?.ComboboxTrigger,
              children: [
                /* @__PURE__ */ jsx(ComboboxSelectedValue, { ...attributes?.ComboboxSelectedValue, children: renderSelectedValue }),
                /* @__PURE__ */ jsx(
                  ComboboxInput,
                  {
                    placeholder,
                    resetValueOnBlur: resetValueOnBlur ?? !renderSelectedValue,
                    required,
                    ...inputAttrs,
                    ...attributes?.ComboboxInput
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            ComboboxContent,
            {
              autoFocusOnHide,
              density,
              hideOnEscape,
              onScrollToBottom,
              portal,
              portalContainer,
              ...contentAttrs,
              ...attributes?.ComboboxContent,
              children: /* @__PURE__ */ jsx(ComboboxSearchProvider, { matchFn: filterMatchFn, children: renderedItems })
            }
          )
        ]
      }
    );
  }
);
Combobox.displayName = "Combobox";

export { Combobox };
