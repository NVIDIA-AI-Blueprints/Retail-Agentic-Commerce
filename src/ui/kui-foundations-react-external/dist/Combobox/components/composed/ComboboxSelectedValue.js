/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsxs, jsx } from 'react/jsx-runtime';
// foundations-css import removed
import React from 'react';
import { useComboboxContext as useComboboxContext$1, useStoreState } from '@ariakit/react';
import { cx } from 'class-variance-authority';
import { Tag } from '../../../Tag/index.js';
import { Icon } from '../../../lib/components/Icon.js';
import { useComboboxContext } from '../../context.js';

const ComboboxSelectedValue = React.forwardRef(({ className, children, onDismiss, ...props }, ref) => {
  const { readOnly, disabled } = useComboboxContext();
  const comboboxContext = useComboboxContext$1();
  if (!comboboxContext) {
    throw new Error(
      "ComboboxSelectedValue must be used within a ComboboxProvider"
    );
  }
  const selectedValue = useStoreState(comboboxContext, "selectedValue");
  const handleDismiss = React.useCallback(() => {
    comboboxContext.setSelectedValue((prev) => Array.isArray(prev) ? [] : "");
    comboboxContext.move(null);
    onDismiss?.();
  }, [comboboxContext, onDismiss]);
  if (children) {
    return children({
      selectedValue,
      setSelectedValue: comboboxContext.setSelectedValue
    });
  }
  const isMulti = Array.isArray(selectedValue);
  if (!isMulti || selectedValue.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxs(
    Tag,
    {
      className: cx("nv-density-compact", className),
      disabled,
      readOnly,
      color: "gray",
      onClick: !(readOnly || disabled) ? handleDismiss : void 0,
      ref,
      ...props,
      children: [
        `${selectedValue.length} selected`,
        /* @__PURE__ */ jsx(Icon, { name: "close", variant: "fill" })
      ]
    }
  );
});
ComboboxSelectedValue.displayName = "ComboboxSelectedValue";

export { ComboboxSelectedValue };
