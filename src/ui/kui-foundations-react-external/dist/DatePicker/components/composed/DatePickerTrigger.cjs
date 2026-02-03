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
var Popover = require('../../../Popover/index.cjs');
var Icon = require('../../../lib/components/Icon.cjs');
var PolymorphicInput = require('../../../lib/components/PolymorphicInput.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');
var utils = require('../../utils.cjs');

const datePickerTrigger = classVarianceAuthority.cva("nv-date-picker-trigger");
const DatePickerTrigger = react.forwardRef(({ className, ...props }, ref) => {
  const context$1 = context.useDatePickerContext();
  const triggerRef = react.useRef(null);
  react.useImperativeHandle(ref, () => triggerRef.current);
  const handleOpen = react.useCallback(() => {
    if (!context$1.open && !context$1.disabled && !context$1.readOnly) {
      context$1.onOpenChange(true);
    }
  }, [context$1]);
  const handleDismiss = react.useCallback(() => {
    if (context$1.kind === "single") {
      context$1.onValueChange?.(void 0);
    }
  }, [context$1]);
  return /* @__PURE__ */ jsxRuntime.jsx(Popover.PopoverAnchor, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(
    PolymorphicInput.PolymorphicInput,
    {
      ...mergeProps.mergeProps(
        {
          ref: triggerRef,
          id: context$1.id,
          "data-testid": constants.DatePickerTestIds.DatePickerTrigger,
          className: datePickerTrigger({ className }),
          size: context$1.size,
          status: context$1.status,
          disabled: context$1.disabled,
          readOnly: context$1.readOnly,
          value: utils.isDate(context$1.value) ? context$1.value : void 0,
          dismissible: context$1.dismissible,
          onDismiss: handleDismiss,
          slotLeft: /* @__PURE__ */ jsxRuntime.jsx(Icon.Icon, { name: "calendar" }),
          expanded: !!context$1.open,
          showChevron: true,
          onClick: handleOpen,
          onFocus: handleOpen
        },
        props
      )
    }
  ) });
});
DatePickerTrigger.displayName = "DatePickerTrigger";

exports.DatePickerTrigger = DatePickerTrigger;
