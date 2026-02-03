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
var reactDialog = require('@radix-ui/react-dialog');
var classVarianceAuthority = require('class-variance-authority');
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');

const modalHeading = classVarianceAuthority.cva("nv-modal-heading", {
  variants: {
    invisible: {
      true: "nv-modal-heading--invisible"
    },
    hidden: {
      true: "nv-modal-heading--hidden"
    }
  },
  defaultVariants: {
    hidden: false
  }
});
const ModalHeading = react.forwardRef(
  ({ className, children, ...props }, ref) => {
    const context$1 = context.useModalContext();
    return /* @__PURE__ */ jsxRuntime.jsx(reactDialog.DialogTitle, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.h2,
      {
        ...mergeProps.mergeProps(
          {
            className: modalHeading({
              className,
              invisible: !children && !context$1.hideCloseButton,
              hidden: !children && context$1.hideCloseButton
            }),
            ref,
            "data-testid": constants.ModalTestIds.ModalHeading
          },
          props
        ),
        children: !children ? "Modal Content" : children
      }
    ) });
  }
);
ModalHeading.displayName = "ModalHeading";

exports.ModalHeading = ModalHeading;
