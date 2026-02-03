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
var Icon = require('../../../lib/components/Icon.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const SelectItem = React__default.default.forwardRef(
  (props, ref) => {
    const selectStore = react.useSelectContext();
    const selected = react.useStoreState(selectStore, "value");
    const isMultiple = Array.isArray(selected);
    const ItemComponent = React__default.default.useMemo(
      () => isMultiple ? Menu.MenuCheckboxItem : Menu.MenuItem,
      [isMultiple]
    );
    const checked = isMultiple ? selected.includes(props.value) : selected === props.value;
    return /* @__PURE__ */ jsxRuntime.jsx(
      react.SelectItem,
      {
        disabled: props.disabled,
        value: props.value,
        render: /* @__PURE__ */ jsxRuntime.jsx(
          ItemComponent,
          {
            checked,
            ref,
            slotLeft: selected ? checked ? /* @__PURE__ */ jsxRuntime.jsx(Icon.Icon, { name: "check" }) : /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, {}) : void 0,
            ...props,
            children: props.children ?? props.value
          }
        )
      }
    );
  }
);
SelectItem.displayName = "SelectItem";

exports.SelectItem = SelectItem;
