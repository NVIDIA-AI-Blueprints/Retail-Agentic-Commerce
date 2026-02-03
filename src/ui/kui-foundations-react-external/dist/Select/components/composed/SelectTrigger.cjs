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
var react = require('@ariakit/react');
var classVarianceAuthority = require('class-variance-authority');
var PolymorphicInput = require('../../../lib/components/PolymorphicInput.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var SelectRoot = require('./SelectRoot.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const selectTrigger = classVarianceAuthority.cva("nv-select-trigger");
const SelectTrigger = React__default.default.forwardRef(
  ({
    className,
    dismissible,
    kind: visualKind,
    placeholder,
    renderValue,
    slotLeft,
    slotRight,
    status,
    ...props
  }, ref) => {
    const { disabled, readOnly, size } = SelectRoot.useSelectContext();
    const selectContext = react.useSelectContext();
    const open = react.useStoreState(selectContext, "open");
    const value = react.useStoreState(selectContext, "value");
    const isMultiple = Array.isArray(value);
    const defaultPlaceholder = isMultiple ? "Select item(s)" : "Select item";
    const handleDismiss = React__default.default.useCallback(() => {
      selectContext?.setValue(isMultiple ? [] : "");
      selectContext?.move(null);
    }, [selectContext, isMultiple]);
    const displayValue = renderValue?.(value, selectContext.setValue) || (Array.isArray(value) ? value.join(", ") : value) || placeholder || defaultPlaceholder;
    return /* @__PURE__ */ jsxRuntime.jsx(
      PolymorphicInput.PolymorphicInput,
      {
        asChild: true,
        className: selectTrigger({ className }),
        size,
        status,
        kind: visualKind,
        disabled,
        readOnly,
        "data-testid": constants.SelectTestIds.SelectTrigger,
        slotLeft,
        slotRight,
        value,
        dismissible,
        onDismiss: dismissible ? handleDismiss : void 0,
        expanded: !!open,
        showChevron: true,
        children: /* @__PURE__ */ jsxRuntime.jsx(
          react.Select,
          {
            ...mergeProps.mergeProps(props, {
              disabled: disabled ?? readOnly,
              ref,
              "aria-labelledby": props["aria-labelledby"],
              "aria-label": props["aria-labelledby"] ? void 0 : props["aria-label"] || "Select trigger"
            }),
            children: displayValue
          }
        )
      }
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

exports.SelectTrigger = SelectTrigger;
