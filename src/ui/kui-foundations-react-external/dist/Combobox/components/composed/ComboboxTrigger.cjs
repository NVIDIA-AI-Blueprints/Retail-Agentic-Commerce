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
var PolymorphicInput = require('../../../lib/components/PolymorphicInput.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const ComboboxTrigger = React__default.default.forwardRef(
  ({
    children,
    className,
    dismissLabel,
    dismissible,
    kind,
    onDismiss,
    slotLeft,
    slotRight,
    status,
    ...props
  }, ref) => {
    const comboboxContext = react.useComboboxContext();
    const open = react.useStoreState(comboboxContext, "open") ?? false;
    const selectedValue = react.useStoreState(comboboxContext, "selectedValue");
    const { size, readOnly, disabled } = context.useComboboxContext();
    const isMulti = Array.isArray(selectedValue);
    const handleDismiss = React__default.default.useCallback(() => {
      comboboxContext?.setSelectedValue(isMulti ? [] : "");
      comboboxContext?.move(null);
      onDismiss?.();
    }, [comboboxContext, onDismiss, isMulti]);
    const handleFocus = React__default.default.useCallback(() => {
      comboboxContext?.setOpen(true);
    }, [comboboxContext?.setOpen]);
    return /* @__PURE__ */ jsxRuntime.jsx(
      react.PopoverAnchor,
      {
        render: /* @__PURE__ */ jsxRuntime.jsx(
          PolymorphicInput.PolymorphicInput,
          {
            className,
            "data-testid": constants.ComboboxTestIds.ComboboxTrigger,
            disabled,
            dismissLabel,
            dismissible,
            expanded: open,
            showChevron: true,
            kind,
            onFocus: handleFocus,
            onDismiss: dismissible ? handleDismiss : void 0,
            readOnly,
            ref,
            size,
            slotLeft,
            slotRight,
            status,
            value: selectedValue,
            ...props,
            children
          }
        )
      }
    );
  }
);
ComboboxTrigger.displayName = "ComboboxTrigger";

exports.ComboboxTrigger = ComboboxTrigger;
