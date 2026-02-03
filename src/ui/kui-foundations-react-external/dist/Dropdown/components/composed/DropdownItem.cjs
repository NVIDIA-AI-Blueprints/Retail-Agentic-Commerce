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
var children = require('../../../lib/utils/children.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

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

const DropdownItem = react.forwardRef(
  ({ onSelect, disabled, filterValue, slotLeft, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      RadixDropdownPrimitives__namespace.DropdownMenuItem,
      {
        onSelect,
        disabled,
        textValue: filterValue ?? children.childrenToText(props.children),
        asChild: true,
        children: /* @__PURE__ */ jsxRuntime.jsx(
          Menu.MenuItem,
          {
            ...mergeProps.mergeProps(
              {
                ref,
                filterValue,
                slotLeft,
                "data-testid": constants.DropdownTestIds.DropdownItem
              },
              props
            )
          }
        )
      }
    );
  }
);
DropdownItem.displayName = "DropdownItem";

exports.DropdownItem = DropdownItem;
