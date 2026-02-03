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

const toastText = classVarianceAuthority.cva("nv-toast-text");
const ToastText = react.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.span,
      {
        ...mergeProps.mergeProps(
          {
            className: toastText({ className }),
            ref,
            "data-testid": constants.ToastTestIds.ToastText
          },
          props
        )
      }
    );
  }
);
ToastText.displayName = "ToastText";

exports.ToastText = ToastText;
