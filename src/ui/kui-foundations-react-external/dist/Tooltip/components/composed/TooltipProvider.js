/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
import { createContext } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

const TooltipContext = createContext(false);
const TooltipProvider = ({
  openDelayDuration = 100,
  skipDelayDuration = 300,
  children
}) => {
  return /* @__PURE__ */ jsx(TooltipContext.Provider, { value: true, children: /* @__PURE__ */ jsx(
    Tooltip.Provider,
    {
      delayDuration: openDelayDuration,
      skipDelayDuration,
      children
    }
  ) });
};

export { TooltipContext, TooltipProvider };
