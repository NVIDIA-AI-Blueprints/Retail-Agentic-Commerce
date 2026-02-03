/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import React from 'react';
import { mergeProps } from '../utils/merge-props.js';

function renderChildren(children, arg) {
  return typeof children === "function" ? children(arg) : children;
}
const Slottable = React.forwardRef(
  ({ asChild, child, children, ...rest }, ref) => {
    if (!React.isValidElement(child)) {
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
      return React.cloneElement(
        child,
        mergeProps({ ...rest, ref }, childProps),
        renderChildren(children, childProps.children)
      );
    }
    return renderChildren(children, child);
  }
);
Slottable.displayName = "Slottable";

export { Slottable };
