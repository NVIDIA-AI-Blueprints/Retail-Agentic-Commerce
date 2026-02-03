/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import React from 'react';
import { useComboboxContext, useStoreState, ComboboxItem as ComboboxItem$1 } from '@ariakit/react';
import { MenuCheckboxItem, MenuItem, useMenuSearchIsMatch } from '../../../Menu/index.js';
import { useComboboxContext as useComboboxContext$1 } from '../../context.js';

const ComboboxItem = React.forwardRef(
  ({ disabled, filterValue, value, ...props }, ref) => {
    const comboboxStore = useComboboxContext();
    const { setSelectedInputValue } = useComboboxContext$1();
    const selected = useStoreState(comboboxStore, "selectedValue");
    const isMultiple = Array.isArray(selected);
    const ItemComponent = React.useMemo(
      () => isMultiple ? MenuCheckboxItem : MenuItem,
      [isMultiple]
    );
    const checked = isMultiple ? selected.includes(value) : selected === value;
    if (useMenuSearchIsMatch(filterValue, value, props.children) === false) {
      return null;
    }
    return /* @__PURE__ */ jsx(
      ComboboxItem$1,
      {
        disabled,
        setValueOnClick: false,
        onClick: () => {
          setSelectedInputValue(filterValue ?? value);
          comboboxStore?.setValue(filterValue ?? value);
        },
        focusOnHover: true,
        render: /* @__PURE__ */ jsx(
          ItemComponent,
          {
            disabled,
            checked,
            ref,
            filterValue,
            ...props
          }
        ),
        value
      }
    );
  }
);
ComboboxItem.displayName = "ComboboxItem";

export { ComboboxItem };
