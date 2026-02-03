/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef, useRef, useImperativeHandle, useCallback } from 'react';
import { cva } from 'class-variance-authority';
import { PopoverAnchor } from '../../../Popover/index.js';
import { Icon } from '../../../lib/components/Icon.js';
import { PolymorphicInput } from '../../../lib/components/PolymorphicInput.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { DatePickerTestIds } from '../../constants.js';
import { useDatePickerContext } from '../../context.js';
import { isDate } from '../../utils.js';

const datePickerTrigger = cva("nv-date-picker-trigger");
const DatePickerTrigger = forwardRef(({ className, ...props }, ref) => {
  const context = useDatePickerContext();
  const triggerRef = useRef(null);
  useImperativeHandle(ref, () => triggerRef.current);
  const handleOpen = useCallback(() => {
    if (!context.open && !context.disabled && !context.readOnly) {
      context.onOpenChange(true);
    }
  }, [context]);
  const handleDismiss = useCallback(() => {
    if (context.kind === "single") {
      context.onValueChange?.(void 0);
    }
  }, [context]);
  return /* @__PURE__ */ jsx(PopoverAnchor, { asChild: true, children: /* @__PURE__ */ jsx(
    PolymorphicInput,
    {
      ...mergeProps(
        {
          ref: triggerRef,
          id: context.id,
          "data-testid": DatePickerTestIds.DatePickerTrigger,
          className: datePickerTrigger({ className }),
          size: context.size,
          status: context.status,
          disabled: context.disabled,
          readOnly: context.readOnly,
          value: isDate(context.value) ? context.value : void 0,
          dismissible: context.dismissible,
          onDismiss: handleDismiss,
          slotLeft: /* @__PURE__ */ jsx(Icon, { name: "calendar" }),
          expanded: !!context.open,
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

export { DatePickerTrigger };
