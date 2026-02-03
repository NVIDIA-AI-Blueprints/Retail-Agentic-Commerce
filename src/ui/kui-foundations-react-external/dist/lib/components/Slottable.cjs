/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var React = require('react');
var mergeProps = require('../utils/merge-props.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

function renderChildren(children, arg) {
  return typeof children === "function" ? children(arg) : children;
}
const Slottable = React__default.default.forwardRef(
  ({ asChild, child, children, ...rest }, ref) => {
    if (!React__default.default.isValidElement(child)) {
      if (asChild) {
        console.warn(
          "@kui/foundations-react/lib/components/Slottable: asChild is true but child is not a valid element. Make sure to render a valid element or component that forwards its props to the child."
        );
        return null;
      } else {
        return renderChildren(children, child);
      }
    }
    if (asChild) {
      const childProps = child.props;
      return React__default.default.cloneElement(
        child,
        mergeProps.mergeProps({ ...rest, ref }, childProps),
        renderChildren(children, childProps.children)
      );
    }
    return renderChildren(children, child);
  }
);
Slottable.displayName = "Slottable";

exports.Slottable = Slottable;
