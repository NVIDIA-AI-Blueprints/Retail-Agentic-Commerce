/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import * as DropdownPrimitives from '@radix-ui/react-dropdown-menu';
import useControllableState from '../../../lib/hooks/use-controllable-state.js';
import { DropdownTestIds } from '../../constants.js';
import { DropdownContext } from '../../context.js';

const DropdownRoot = ({
  open,
  onOpenChange,
  size,
  defaultOpen = false,
  modal = false,
  children
}) => {
  const [internalOpen, setInternalOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange
  });
  return /* @__PURE__ */ jsx(DropdownContext.Provider, { value: { open: internalOpen, size }, children: /* @__PURE__ */ jsx(
    DropdownPrimitives.DropdownMenu,
    {
      open: internalOpen,
      onOpenChange: setInternalOpen,
      modal,
      "data-testid": DropdownTestIds.DropdownRoot,
      children
    }
  ) });
};
DropdownRoot.displayName = "DropdownRoot";

export { DropdownRoot };
