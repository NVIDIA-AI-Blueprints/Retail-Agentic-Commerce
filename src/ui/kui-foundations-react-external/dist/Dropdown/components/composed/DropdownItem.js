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
import { MenuItem } from '../../../Menu/index.js';
import { childrenToText } from '../../../lib/utils/children.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { DropdownTestIds } from '../../constants.js';

const DropdownItem = forwardRef(
  ({ onSelect, disabled, filterValue, slotLeft, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      RadixDropdownPrimitives.DropdownMenuItem,
      {
        onSelect,
        disabled,
        textValue: filterValue ?? childrenToText(props.children),
        asChild: true,
        children: /* @__PURE__ */ jsx(
          MenuItem,
          {
            ...mergeProps(
              {
                ref,
                filterValue,
                slotLeft,
                "data-testid": DropdownTestIds.DropdownItem
              },
              props
            )
          }
        )
      }
    );
  }
);
DropdownItem.displayName = "DropdownItem";

export { DropdownItem };
