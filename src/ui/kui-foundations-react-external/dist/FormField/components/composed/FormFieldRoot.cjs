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

const formFieldRoot = classVarianceAuthority.cva("nv-form-field-root", {
  variants: {
    labelPosition: {
      left: "nv-form-field-root--label-position-left",
      top: ""
    },
    required: {
      true: "nv-form-field-root--required"
    }
  },
  defaultVariants: {
    labelPosition: "top"
  }
});
const FormFieldRoot = react.forwardRef(
  ({ className, labelPosition = "top", required, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.div,
      {
        ...mergeProps.mergeProps(
          {
            className: formFieldRoot({ className, labelPosition, required }),
            ref,
            "data-testid": constants.FormFieldTestIds.FormFieldRoot
          },
          props
        )
      }
    );
  }
);
FormFieldRoot.displayName = "FormFieldRoot";

exports.FormFieldRoot = FormFieldRoot;
