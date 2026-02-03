/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import React from 'react';
import { useSelectContext as useSelectContext$1, useStoreState, Select } from '@ariakit/react';
import { cva } from 'class-variance-authority';
import { PolymorphicInput } from '../../../lib/components/PolymorphicInput.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { SelectTestIds } from '../../constants.js';
import { useSelectContext } from './SelectRoot.js';

const selectTrigger = cva("nv-select-trigger");
const SelectTrigger = React.forwardRef(
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
    const { disabled, readOnly, size } = useSelectContext();
    const selectContext = useSelectContext$1();
    const open = useStoreState(selectContext, "open");
    const value = useStoreState(selectContext, "value");
    const isMultiple = Array.isArray(value);
    const defaultPlaceholder = isMultiple ? "Select item(s)" : "Select item";
    const handleDismiss = React.useCallback(() => {
      selectContext?.setValue(isMultiple ? [] : "");
      selectContext?.move(null);
    }, [selectContext, isMultiple]);
    const displayValue = renderValue?.(value, selectContext.setValue) || (Array.isArray(value) ? value.join(", ") : value) || placeholder || defaultPlaceholder;
    return /* @__PURE__ */ jsx(
      PolymorphicInput,
      {
        asChild: true,
        className: selectTrigger({ className }),
        size,
        status,
        kind: visualKind,
        disabled,
        readOnly,
        "data-testid": SelectTestIds.SelectTrigger,
        slotLeft,
        slotRight,
        value,
        dismissible,
        onDismiss: dismissible ? handleDismiss : void 0,
        expanded: !!open,
        showChevron: true,
        children: /* @__PURE__ */ jsx(
          Select,
          {
            ...mergeProps(props, {
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

export { SelectTrigger };
