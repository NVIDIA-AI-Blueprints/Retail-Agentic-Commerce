/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
import { forwardRef } from 'react';
import { Button } from '../../../Button/index.js';
import { Icon } from '../../../lib/components/Icon.js';

const AppBarExpanderButton = forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      Button,
      {
        ref,
        "aria-label": "Expand",
        className: `nv-app-bar-expander-button ${className}`,
        kind: "tertiary",
        size: "small",
        ...props,
        children: /* @__PURE__ */ jsx(Icon, { name: "menu" })
      }
    );
  }
);
AppBarExpanderButton.displayName = "AppBarExpanderButton";

export { AppBarExpanderButton };
