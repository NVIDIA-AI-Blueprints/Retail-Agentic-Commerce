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

const formFieldHelper = classVarianceAuthority.cva("nv-form-field-helper", {
  variants: {
    kind: {
      info: "",
      success: "nv-form-field-helper--kind-success",
      error: "nv-form-field-helper--kind-error"
    }
  },
  defaultVariants: {
    kind: "info"
  }
});
const FormFieldHelper = react.forwardRef(
  ({ className, kind, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.div,
      {
        ...mergeProps.mergeProps(
          {
            className: formFieldHelper({ className, kind }),
            ref,
            "data-testid": constants.FormFieldTestIds.FormFieldHelper,
            role: "status"
          },
          props
        )
      }
    );
  }
);
FormFieldHelper.displayName = "FormFieldHelper";

exports.FormFieldHelper = FormFieldHelper;
