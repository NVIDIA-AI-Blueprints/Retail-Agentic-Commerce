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
var useElementAttributes = require('../../../lib/hooks/use-element-attributes.cjs');
var utils = require('../../utils.cjs');
var SelectContent = require('../composed/SelectContent.cjs');
var SelectItem = require('../composed/SelectItem.cjs');
var SelectRoot = require('../composed/SelectRoot.cjs');
var SelectTrigger = require('../composed/SelectTrigger.cjs');

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
            typeof subEntry === "string" ? subEntry : subEntry.value || idx
          ))
        ]
      },
      entry.slotHeading?.toString()
    );
  }
  if (typeof entry === "string") {
    return /* @__PURE__ */ jsxRuntime.jsx(SelectItem.SelectItem, { value: entry, children: entry }, entry);
  }
  return /* @__PURE__ */ jsxRuntime.jsx(
    SelectItem.SelectItem,
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
const Select = React__default.default.forwardRef(
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
    const [triggerAttrs, contentAttrs] = useElementAttributes.useElementAttributes(
      props,
      ["button", SelectTrigger.SelectTrigger],
      ["menu", SelectContent.SelectContent]
    );
    const renderedItems = React__default.default.useMemo(() => {
      return items?.map((entry) => renderEntry(entry));
    }, [items]);
    const renderValueProp = React__default.default.useCallback(
      (value2) => {
        return utils.getSelectedItemValue(
          value2,
          items
        );
      },
      [items]
    );
    return /* @__PURE__ */ jsxRuntime.jsxs(
      SelectRoot.SelectRoot,
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
          /* @__PURE__ */ jsxRuntime.jsx(
            SelectTrigger.SelectTrigger,
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
          /* @__PURE__ */ jsxRuntime.jsx(
            SelectContent.SelectContent,
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

exports.Select = Select;
