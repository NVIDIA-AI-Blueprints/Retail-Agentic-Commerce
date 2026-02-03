/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import React from 'react';
import { useComboboxContext, useStoreState, PopoverAnchor } from '@ariakit/react';
import { PolymorphicInput } from '../../../lib/components/PolymorphicInput.js';
import { ComboboxTestIds } from '../../constants.js';
import { useComboboxContext as useComboboxContext$1 } from '../../context.js';

const ComboboxTrigger = React.forwardRef(
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
    const comboboxContext = useComboboxContext();
    const open = useStoreState(comboboxContext, "open") ?? false;
    const selectedValue = useStoreState(comboboxContext, "selectedValue");
    const { size, readOnly, disabled } = useComboboxContext$1();
    const isMulti = Array.isArray(selectedValue);
    const handleDismiss = React.useCallback(() => {
      comboboxContext?.setSelectedValue(isMulti ? [] : "");
      comboboxContext?.move(null);
      onDismiss?.();
    }, [comboboxContext, onDismiss, isMulti]);
    const handleFocus = React.useCallback(() => {
      comboboxContext?.setOpen(true);
    }, [comboboxContext?.setOpen]);
    return /* @__PURE__ */ jsx(
      PopoverAnchor,
      {
        render: /* @__PURE__ */ jsx(
          PolymorphicInput,
          {
            className,
            "data-testid": ComboboxTestIds.ComboboxTrigger,
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

export { ComboboxTrigger };
