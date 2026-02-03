/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var Flex = require('../../../Flex/index.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const Stack = React__default.default.forwardRef(
  ({ direction = "col", children, slotDivider, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(Flex.Flex, { ...props, direction, ref, children: slotDivider ? React__default.default.Children.toArray(children).map((child, i, arr) => {
    const childIsFragment = i === 0 && React__default.default.isValidElement(child) && child.type === React__default.default.Fragment;
    if (childIsFragment && child.props && typeof child.props === "object" && "children" in child.props && Array.isArray(child.props.children))
      return React__default.default.Children.toArray(child.props.children).map(
        (innerChild, i2, innerChildArr) => {
          return /* @__PURE__ */ jsxRuntime.jsxs(React__default.default.Fragment, { children: [
            innerChild,
            i2 !== innerChildArr.length - 1 && slotDivider
          ] }, i2);
        }
      );
    return /* @__PURE__ */ jsxRuntime.jsxs(React__default.default.Fragment, { children: [
      child,
      i !== arr.length - 1 && slotDivider
    ] }, i);
  }) : (
    // If no slotDivider is passed, render the children as is
    children
  ) })
);
Stack.displayName = "Stack";

exports.Stack = Stack;
