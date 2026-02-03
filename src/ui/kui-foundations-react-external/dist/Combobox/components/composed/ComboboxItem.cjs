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
var react = require('@ariakit/react');
var Menu = require('../../../Menu/index.cjs');
var context = require('../../context.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const ComboboxItem = React__default.default.forwardRef(
  ({ disabled, filterValue, value, ...props }, ref) => {
    const comboboxStore = react.useComboboxContext();
    const { setSelectedInputValue } = context.useComboboxContext();
    const selected = react.useStoreState(comboboxStore, "selectedValue");
    const isMultiple = Array.isArray(selected);
    const ItemComponent = React__default.default.useMemo(
      () => isMultiple ? Menu.MenuCheckboxItem : Menu.MenuItem,
      [isMultiple]
    );
    const checked = isMultiple ? selected.includes(value) : selected === value;
    if (Menu.useMenuSearchIsMatch(filterValue, value, props.children) === false) {
      return null;
    }
    return /* @__PURE__ */ jsxRuntime.jsx(
      react.ComboboxItem,
      {
        disabled,
        setValueOnClick: false,
        onClick: () => {
          setSelectedInputValue(filterValue ?? value);
          comboboxStore?.setValue(filterValue ?? value);
        },
        focusOnHover: true,
        render: /* @__PURE__ */ jsxRuntime.jsx(
          ItemComponent,
          {
            disabled,
            checked,
            ref,
            filterValue,
            ...props
          }
        ),
        value
      }
    );
  }
);
ComboboxItem.displayName = "ComboboxItem";

exports.ComboboxItem = ComboboxItem;
