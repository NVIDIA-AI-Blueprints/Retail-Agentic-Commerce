/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import * as RadixPopoverPrimitives from '@radix-ui/react-popover';
import { PopoverTestIds } from '../../constants.js';

const PopoverRoot = ({
  defaultOpen,
  open,
  onOpenChange,
  modal = false,
  children
}) => {
  return /* @__PURE__ */ jsx(
    RadixPopoverPrimitives.Root,
    {
      defaultOpen,
      open,
      onOpenChange,
      modal,
      "data-testid": PopoverTestIds.PopoverRoot,
      children
    }
  );
};

export { PopoverRoot };
