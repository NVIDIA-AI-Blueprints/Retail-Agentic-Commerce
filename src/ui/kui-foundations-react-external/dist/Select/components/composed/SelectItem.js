/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx, Fragment } from 'react/jsx-runtime';
// foundations-css import removed
import React from 'react';
import { useSelectContext, useStoreState, SelectItem as SelectItem$1 } from '@ariakit/react';
import { MenuCheckboxItem, MenuItem } from '../../../Menu/index.js';
import { Icon } from '../../../lib/components/Icon.js';

const SelectItem = React.forwardRef(
  (props, ref) => {
    const selectStore = useSelectContext();
    const selected = useStoreState(selectStore, "value");
    const isMultiple = Array.isArray(selected);
    const ItemComponent = React.useMemo(
      () => isMultiple ? MenuCheckboxItem : MenuItem,
      [isMultiple]
    );
    const checked = isMultiple ? selected.includes(props.value) : selected === props.value;
    return /* @__PURE__ */ jsx(
      SelectItem$1,
      {
        disabled: props.disabled,
        value: props.value,
        render: /* @__PURE__ */ jsx(
          ItemComponent,
          {
            checked,
            ref,
            slotLeft: selected ? checked ? /* @__PURE__ */ jsx(Icon, { name: "check" }) : /* @__PURE__ */ jsx(Fragment, {}) : void 0,
            ...props,
            children: props.children ?? props.value
          }
        )
      }
    );
  }
);
SelectItem.displayName = "SelectItem";

export { SelectItem };
