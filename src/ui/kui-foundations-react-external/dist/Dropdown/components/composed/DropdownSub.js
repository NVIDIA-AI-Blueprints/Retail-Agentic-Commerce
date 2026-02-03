/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import * as RadixDropdownPrimitives from '@radix-ui/react-dropdown-menu';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { DropdownTestIds } from '../../constants.js';

const DropdownSub = (props) => {
  return /* @__PURE__ */ jsx(
    RadixDropdownPrimitives.DropdownMenuSub,
    {
      ...mergeProps(
        { "data-testid": DropdownTestIds.DropdownSub },
        { ...props }
      )
    }
  );
};
DropdownSub.displayName = "DropdownSub";

export { DropdownSub };
