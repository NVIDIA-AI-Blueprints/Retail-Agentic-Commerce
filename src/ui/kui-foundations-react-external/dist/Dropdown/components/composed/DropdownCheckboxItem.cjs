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
var RadixDropdownPrimitives = require('@radix-ui/react-dropdown-menu');
var Menu = require('../../../Menu/index.cjs');
var useControllableState = require('../../../lib/hooks/use-controllable-state.cjs');
var children = require('../../../lib/utils/children.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var RadixDropdownPrimitives__namespace = /*#__PURE__*/_interopNamespace(RadixDropdownPrimitives);
var useControllableState__default = /*#__PURE__*/_interopDefault(useControllableState);

const DEBOUNCE_THRESHOLD = 50;
const DropdownCheckboxItem = react.forwardRef(
  ({
    checked,
    closeMenuOnSelect,
    defaultChecked,
    disabled,
    onCheckedChange,
    onSelect,
    filterValue,
    ...props
  }, ref) => {
    const lastInteractionTime = react.useRef(0);
    const handleCheckedChange = react.useCallback(
      (newChecked) => {
        const now = Date.now();
        if (now - lastInteractionTime.current < DEBOUNCE_THRESHOLD) {
          return;
        }
        lastInteractionTime.current = now;
        onCheckedChange?.(newChecked);
      },
      [onCheckedChange]
    );
    const [internalChecked, setInternalChecked] = useControllableState__default.default({
      value: checked,
      defaultValue: defaultChecked,
      onChange: handleCheckedChange
    });
    return /* @__PURE__ */ jsxRuntime.jsx(
      RadixDropdownPrimitives__namespace.CheckboxItem,
      {
        checked: internalChecked,
        disabled,
        onSelect: (e) => {
          if (!closeMenuOnSelect) {
            e.preventDefault();
          }
          setInternalChecked(
            internalChecked === "indeterminate" ? true : !internalChecked
          );
          onSelect?.(e);
        },
        textValue: filterValue ?? children.childrenToText(props.children),
        asChild: true,
        children: /* @__PURE__ */ jsxRuntime.jsx(
          Menu.MenuCheckboxItem,
          {
            ...mergeProps.mergeProps(
              { ref, "data-testid": constants.DropdownTestIds.DropdownCheckboxItem },
              props
            ),
            checked: internalChecked,
            onCheckedChange: setInternalChecked,
            disabled
          }
        )
      }
    );
  }
);
DropdownCheckboxItem.displayName = "DropdownCheckboxItem";

exports.DropdownCheckboxItem = DropdownCheckboxItem;
