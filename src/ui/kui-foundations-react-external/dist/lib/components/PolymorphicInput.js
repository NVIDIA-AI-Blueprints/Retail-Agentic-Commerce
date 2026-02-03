/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef, useRef, useCallback } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { AnimatedChevron } from '../../AnimatedChevron/index.js';
import { mergeProps } from '../utils/merge-props.js';
import { Icon } from './Icon.js';
import { Slottable } from './Slottable.js';

const polymorphicInput = cva("nv-input", {
  variants: {
    size: {
      small: "nv-input--size-small",
      medium: "",
      large: "nv-input--size-large"
    },
    status: {
      error: "nv-input--status-error",
      success: "nv-input--status-success"
    },
    kind: {
      floating: "nv-input--kind-floating",
      flat: "nv-input--kind-flat"
    },
    disabled: {
      true: "nv-input--disabled"
    },
    readOnly: {
      true: "nv-input--readonly"
    }
  },
  defaultVariants: {
    size: "medium",
    kind: "flat"
  }
});
const PolymorphicInput = forwardRef(
  ({
    asChild,
    children,
    className,
    size,
    status,
    showChevron,
    kind,
    disabled,
    readOnly,
    value,
    slotLeft,
    slotRight,
    expanded,
    dismissible,
    onClick,
    onDismiss,
    dismissLabel = "Clear",
    ...props
  }, ref) => {
    const innerRef = useRef(null);
    const Component = asChild ? Slot : "div";
    const shouldShowPlaceholder = !value || Array.isArray(value) && value.length === 0;
    const handleClick = useCallback(
      (event) => {
        onClick?.(event);
        if (!disabled && !readOnly) {
          const focusableElement = innerRef?.current?.querySelector(
            "input, textarea, select"
          );
          if (focusableElement) {
            focusableElement.focus();
          }
        }
      },
      [disabled, readOnly, onClick]
    );
    return /* @__PURE__ */ jsx(
      Component,
      {
        ...mergeProps(
          {
            className: polymorphicInput({
              className,
              size,
              status,
              kind,
              disabled,
              readOnly
            }),
            ref,
            "data-placeholder": shouldShowPlaceholder ? "true" : void 0,
            "data-state": expanded ? "open" : "closed",
            onClick: handleClick
          },
          props
        ),
        children: /* @__PURE__ */ jsx(Slottable, { asChild, child: children, children: (child) => /* @__PURE__ */ jsxs(Fragment, { children: [
          slotLeft,
          /* @__PURE__ */ jsx("div", { ref: innerRef, className: "nv-input-content", children: child }),
          slotRight,
          dismissible && /* @__PURE__ */ jsx(
            "div",
            {
              tabIndex: 0,
              role: "button",
              className: "nv-input-dismiss-button",
              onClick: onDismiss,
              onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onDismiss?.();
                }
              },
              "aria-label": dismissLabel,
              "data-dismiss": true,
              children: /* @__PURE__ */ jsx(Icon, { name: "close" })
            }
          ),
          expanded !== void 0 && showChevron ? /* @__PURE__ */ jsx(AnimatedChevron, { state: expanded ? "open" : "closed" }) : null
        ] }) })
      }
    );
  }
);
PolymorphicInput.displayName = "Input";

export { PolymorphicInput };
