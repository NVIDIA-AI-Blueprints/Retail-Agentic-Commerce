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
var classVarianceAuthority = require('class-variance-authority');
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

const statusMessageRoot = classVarianceAuthority.cva("nv-status-message-root", {
  variants: {
    size: {
      small: "nv-status-message-root--size-small",
      medium: ""
    }
  },
  defaultVariants: {
    size: "medium"
  }
});
const StatusMessageRoot = react.forwardRef(({ className, size, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    primitive.Primitive.div,
    {
      ...mergeProps.mergeProps(
        {
          className: statusMessageRoot({ className, size }),
          ref,
          "data-testid": constants.StatusMessageTestIds.StatusMessageRoot
        },
        props
      )
    }
  );
});
StatusMessageRoot.displayName = "StatusMessageRoot";

exports.StatusMessageRoot = StatusMessageRoot;
