/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx, jsxs } from 'react/jsx-runtime';
import React from 'react';
import { Flex } from '../../../Flex/index.js';

const Stack = React.forwardRef(
  ({ direction = "col", children, slotDivider, ...props }, ref) => /* @__PURE__ */ jsx(Flex, { ...props, direction, ref, children: slotDivider ? React.Children.toArray(children).map((child, i, arr) => {
    const childIsFragment = i === 0 && React.isValidElement(child) && child.type === React.Fragment;
    if (childIsFragment && child.props && typeof child.props === "object" && "children" in child.props && Array.isArray(child.props.children))
      return React.Children.toArray(child.props.children).map(
        (innerChild, i2, innerChildArr) => {
          return /* @__PURE__ */ jsxs(React.Fragment, { children: [
            innerChild,
            i2 !== innerChildArr.length - 1 && slotDivider
          ] }, i2);
        }
      );
    return /* @__PURE__ */ jsxs(React.Fragment, { children: [
      child,
      i !== arr.length - 1 && slotDivider
    ] }, i);
  }) : (
    // If no slotDivider is passed, render the children as is
    children
  ) })
);
Stack.displayName = "Stack";

export { Stack };
