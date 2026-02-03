/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import * as RadixDropdownPrimitives from '@radix-ui/react-dropdown-menu';
import { MenuRadioGroupItem } from '../../../Menu/index.js';
import { childrenToText } from '../../../lib/utils/children.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { DropdownTestIds } from '../../constants.js';
import { useDropdownRadioGroupContext } from '../../context.js';

const DropdownRadioGroupItem = forwardRef(
  ({ closeMenuOnSelect, disabled, onSelect, filterValue, value, ...props }, ref) => {
    const context = useDropdownRadioGroupContext();
    return /* @__PURE__ */ jsx(
      RadixDropdownPrimitives.RadioItem,
      {
        value,
        onSelect: (e) => {
          if (!closeMenuOnSelect) {
            e.preventDefault();
          }
          context.onValueChange?.(value);
          onSelect?.(e);
        },
        disabled,
        textValue: filterValue ?? childrenToText(props.children),
        asChild: true,
        children: /* @__PURE__ */ jsx(
          MenuRadioGroupItem,
          {
            ...mergeProps(
              { ref, "data-testid": DropdownTestIds.DropdownRadioGroupItem },
              props
            ),
            disabled,
            value
          }
        )
      }
    );
  }
);
DropdownRadioGroupItem.displayName = "DropdownRadioGroupItem";

export { DropdownRadioGroupItem };
