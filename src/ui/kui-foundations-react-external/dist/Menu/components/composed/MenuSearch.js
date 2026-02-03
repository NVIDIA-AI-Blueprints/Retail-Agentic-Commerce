/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { TextInput } from '../../../TextInput/index.js';
import { Icon } from '../../../lib/components/Icon.js';
import { MenuTestIds } from '../../constants.js';
import { useMenuSearchHandlers } from './MenuSearchProvider.js';

const menuSection = cva("nv-menu-search");
const MenuSearch = forwardRef(
  ({ className, placeholder = "Filter items", ...props }, ref) => {
    const ctx = useMenuSearchHandlers();
    return /* @__PURE__ */ jsx(
      TextInput,
      {
        ref,
        role: "menuitem",
        slotLeft: /* @__PURE__ */ jsx(Icon, { name: "filter", variant: "fill" }),
        placeholder,
        className: menuSection({ className }),
        "data-testid": MenuTestIds.MenuSearch,
        onValueChange: ctx?.setValue,
        ...props
      }
    );
  }
);
MenuSearch.displayName = "MenuSearch";

export { MenuSearch };
