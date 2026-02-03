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
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');

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

const DropdownRadioGroup = react.forwardRef(({ value, defaultValue = "", onValueChange, ...props }, ref) => {
  const [internalValue, setInternalValue] = useControllableState__default.default({
    value,
    defaultValue,
    onChange: onValueChange
  });
  return /* @__PURE__ */ jsxRuntime.jsx(
    context.DropdownRadioGroupContext.Provider,
    {
      value: { value: internalValue, onValueChange: setInternalValue },
      children: /* @__PURE__ */ jsxRuntime.jsx(
        RadixDropdownPrimitives__namespace.RadioGroup,
        {
          value: internalValue,
          onValueChange: setInternalValue,
          asChild: true,
          children: /* @__PURE__ */ jsxRuntime.jsx(
            Menu.MenuRadioGroup,
            {
              ...mergeProps.mergeProps(
                { ref, "data-testid": constants.DropdownTestIds.DropdownRadioGroup },
                props
              )
            }
          )
        }
      )
    }
  );
});
DropdownRadioGroup.displayName = "DropdownRadioGroup";

exports.DropdownRadioGroup = DropdownRadioGroup;
