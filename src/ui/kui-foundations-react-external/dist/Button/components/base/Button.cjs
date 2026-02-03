/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
// foundations-css import removed
var React = require('react');
var classVarianceAuthority = require('class-variance-authority');
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const button = classVarianceAuthority.cva("nv-button", {
  variants: {
    size: {
      tiny: "nv-button--size-tiny",
      small: "nv-button--size-small",
      medium: "nv-button--size-medium",
      large: "nv-button--size-large"
    },
    kind: {
      primary: "nv-button--kind-primary",
      secondary: "nv-button--kind-secondary",
      tertiary: "nv-button--kind-tertiary"
    },
    color: {
      brand: "nv-button--color-brand",
      neutral: "nv-button--color-neutral",
      danger: "nv-button--color-danger"
    }
  }
});
const Button = React__default.default.forwardRef(
  ({ tone, className, kind, size, children, color, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.button,
      {
        ...mergeProps.mergeProps(
          {
            className: button({
              className,
              kind: kind || tone,
              size,
              color
            }),
            ref,
            "data-testid": constants.ButtonTestIds.Button
          },
          props
        ),
        children
      }
    );
  }
);
Button.displayName = "Button";

exports.Button = Button;
