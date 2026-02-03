/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
// foundations-css import removed
var React = require('react');
var Menu = require('../../../Menu/index.cjs');
var utils = require('../../../Select/utils.cjs');
var useElementAttributes = require('../../../lib/hooks/use-element-attributes.cjs');
var ComboboxContent = require('../composed/ComboboxContent.cjs');
var ComboboxInput = require('../composed/ComboboxInput.cjs');
var ComboboxItem = require('../composed/ComboboxItem.cjs');
var ComboboxRoot = require('../composed/ComboboxRoot.cjs');
var ComboboxSearchProvider = require('../composed/ComboboxSearchProvider.cjs');
var ComboboxSelectedValue = require('../composed/ComboboxSelectedValue.cjs');
var ComboboxTrigger = require('../composed/ComboboxTrigger.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const renderEntry = (entry) => {
  if (utils.isSection(entry)) {
    return /* @__PURE__ */ jsxRuntime.jsxs(
      Menu.MenuSection,
      {
        ...entry.attributes?.MenuSection,
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(Menu.MenuHeading, { ...entry.attributes?.MenuHeading, children: entry.slotHeading }),
          entry.items.map((subEntry, idx) => /* @__PURE__ */ jsxRuntime.jsx(
            React__default.default.Fragment,
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
    return /* @__PURE__ */ jsxRuntime.jsx(ComboboxItem.ComboboxItem, { filterValue: entry, value: entry, children: entry }, entry);
  }
  return /* @__PURE__ */ jsxRuntime.jsx(
    ComboboxItem.ComboboxItem,
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
const Combobox = React__default.default.forwardRef(
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
    const [inputAttrs, contentAttrs] = useElementAttributes.useElementAttributes(
      props,
      ["input", ComboboxInput.ComboboxInput],
      ["menu", ComboboxContent.ComboboxContent]
    );
    const renderedItems = React__default.default.useMemo(() => {
      return items?.map((entry) => renderEntry(entry));
    }, [items]);
    return /* @__PURE__ */ jsxRuntime.jsxs(
      ComboboxRoot.ComboboxRoot,
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
          /* @__PURE__ */ jsxRuntime.jsxs(
            ComboboxTrigger.ComboboxTrigger,
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
                /* @__PURE__ */ jsxRuntime.jsx(ComboboxSelectedValue.ComboboxSelectedValue, { ...attributes?.ComboboxSelectedValue, children: renderSelectedValue }),
                /* @__PURE__ */ jsxRuntime.jsx(
                  ComboboxInput.ComboboxInput,
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
          /* @__PURE__ */ jsxRuntime.jsx(
            ComboboxContent.ComboboxContent,
            {
              autoFocusOnHide,
              density,
              hideOnEscape,
              onScrollToBottom,
              portal,
              portalContainer,
              ...contentAttrs,
              ...attributes?.ComboboxContent,
              children: /* @__PURE__ */ jsxRuntime.jsx(ComboboxSearchProvider.ComboboxSearchProvider, { matchFn: filterMatchFn, children: renderedItems })
            }
          )
        ]
      }
    );
  }
);
Combobox.displayName = "Combobox";

exports.Combobox = Combobox;
