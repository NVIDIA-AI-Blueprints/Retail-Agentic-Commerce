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
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

const ModalTrigger = react.forwardRef(
  ({ className, children, asChild, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(reactDialog.DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.button,
      {
        ...mergeProps.mergeProps(
          {
            className,
            ref,
            "data-testid": constants.ModalTestIds.ModalTrigger,
            asChild: typeof children === "string" ? false : asChild
          },
          props
        ),
        children
      }
    ) });
  }
);
ModalTrigger.displayName = "ModalTrigger";

exports.ModalTrigger = ModalTrigger;
