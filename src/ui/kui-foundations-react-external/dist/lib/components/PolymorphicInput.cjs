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
var reactSlot = require('@radix-ui/react-slot');
var classVarianceAuthority = require('class-variance-authority');
var AnimatedChevron = require('../../AnimatedChevron/index.cjs');
var mergeProps = require('../utils/merge-props.cjs');
var Icon = require('./Icon.cjs');
var Slottable = require('./Slottable.cjs');

const polymorphicInput = classVarianceAuthority.cva("nv-input", {
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
const PolymorphicInput = react.forwardRef(
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
    const innerRef = react.useRef(null);
    const Component = asChild ? reactSlot.Slot : "div";
    const shouldShowPlaceholder = !value || Array.isArray(value) && value.length === 0;
    const handleClick = react.useCallback(
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
    return /* @__PURE__ */ jsxRuntime.jsx(
      Component,
      {
        ...mergeProps.mergeProps(
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
        children: /* @__PURE__ */ jsxRuntime.jsx(Slottable.Slottable, { asChild, child: children, children: (child) => /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
          slotLeft,
          /* @__PURE__ */ jsxRuntime.jsx("div", { ref: innerRef, className: "nv-input-content", children: child }),
          slotRight,
          dismissible && /* @__PURE__ */ jsxRuntime.jsx(
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
              children: /* @__PURE__ */ jsxRuntime.jsx(Icon.Icon, { name: "close" })
            }
          ),
          expanded !== void 0 && showChevron ? /* @__PURE__ */ jsxRuntime.jsx(AnimatedChevron.AnimatedChevron, { state: expanded ? "open" : "closed" }) : null
        ] }) })
      }
    );
  }
);
PolymorphicInput.displayName = "Input";

exports.PolymorphicInput = PolymorphicInput;
