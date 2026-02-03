/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
var react = require('react');
var classVarianceAuthority = require('class-variance-authority');
var Button = require('../../../Button/index.cjs');
var Group = require('../../../Group/index.cjs');
var constants = require('../../constants.cjs');

const buttonGroup = classVarianceAuthority.cva("nv-button-group", {
  variants: {
    kind: {
      primary: "nv-button-group--kind-primary",
      secondary: "nv-button-group--kind-secondary",
      tertiary: "nv-button-group--kind-tertiary"
    },
    size: {
      tiny: "nv-button-group--size-tiny",
      small: "nv-button-group--size-small",
      medium: "nv-button-group--size-medium",
      large: "nv-button-group--size-large"
    }
  }
});
const ButtonGroup = react.forwardRef(
  ({
    children,
    className,
    disabled,
    groupKind,
    items,
    size,
    kind = "primary",
    color,
    ...props
  }, ref) => {
    const defaultGroupKind = kind === "primary" ? "gap" : kind === "secondary" ? "flush" : "border";
    const content = children ?? items?.map(({ children: children2, key, ...props2 }) => /* @__PURE__ */ react.createElement(
      Button.Button,
      {
        ...props2,
        size,
        kind,
        color,
        disabled: disabled ?? props2.disabled,
        key: key ?? children2
      },
      children2
    ));
    return /* @__PURE__ */ jsxRuntime.jsx(
      Group.Group,
      {
        className: buttonGroup({ className, kind, size }),
        "data-testid": constants.ButtonGroupTestIds.ButtonGroup,
        kind: groupKind ?? defaultGroupKind,
        ref,
        ...props,
        children: content
      }
    );
  }
);
ButtonGroup.displayName = "ButtonGroup";

exports.ButtonGroup = ButtonGroup;
