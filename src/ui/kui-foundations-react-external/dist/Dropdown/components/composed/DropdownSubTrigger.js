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
import { cva } from 'class-variance-authority';
import { MenuItem } from '../../../Menu/index.js';
import { Icon } from '../../../lib/components/Icon.js';
import { childrenToText } from '../../../lib/utils/children.js';
import { DropdownTestIds } from '../../constants.js';

const dropdownSubTrigger = cva("nv-dropdown-sub-trigger");
const DropdownSubTrigger = forwardRef(({ disabled, children, className, filterValue, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    RadixDropdownPrimitives.SubTrigger,
    {
      textValue: filterValue ?? childrenToText(children),
      disabled,
      asChild: true,
      children: /* @__PURE__ */ jsx(
        MenuItem,
        {
          disabled,
          ref,
          "data-testid": DropdownTestIds.DropdownSubTrigger,
          className: dropdownSubTrigger({ className }),
          slotRight: /* @__PURE__ */ jsx(Icon, { name: "chevron-right" }),
          ...props,
          children
        }
      )
    }
  );
});
DropdownSubTrigger.displayName = "DropdownSubTrigger";

export { DropdownSubTrigger };
