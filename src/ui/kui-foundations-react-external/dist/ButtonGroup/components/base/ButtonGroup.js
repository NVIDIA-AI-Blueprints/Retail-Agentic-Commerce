/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
import { forwardRef, createElement } from 'react';
import { cva } from 'class-variance-authority';
import { Button } from '../../../Button/index.js';
import { Group } from '../../../Group/index.js';
import { ButtonGroupTestIds } from '../../constants.js';

const buttonGroup = cva("nv-button-group", {
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
const ButtonGroup = forwardRef(
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
    const content = children ?? items?.map(({ children: children2, key, ...props2 }) => /* @__PURE__ */ createElement(
      Button,
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
    return /* @__PURE__ */ jsx(
      Group,
      {
        className: buttonGroup({ className, kind, size }),
        "data-testid": ButtonGroupTestIds.ButtonGroup,
        kind: groupKind ?? defaultGroupKind,
        ref,
        ...props,
        children: content
      }
    );
  }
);
ButtonGroup.displayName = "ButtonGroup";

export { ButtonGroup };
