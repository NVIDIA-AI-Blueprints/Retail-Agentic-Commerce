/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import React from 'react';
import { cva } from 'class-variance-authority';
import { Icon } from '../../../lib/components/Icon.js';

const animatedChevron = cva("nv-animated-chevron");
const AnimatedChevron = React.forwardRef(({ className, state, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    Icon,
    {
      name: "chevron-down",
      className: animatedChevron({ className }),
      "data-state": state,
      variant: "line",
      ref,
      ...props
    }
  );
});
AnimatedChevron.displayName = "AnimatedChevron";

export { AnimatedChevron };
