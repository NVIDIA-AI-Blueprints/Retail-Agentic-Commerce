/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
import * as Tooltip from '@radix-ui/react-tooltip';

const TooltipRoot = ({
  children,
  openDelayDuration,
  defaultOpen,
  onOpenChange,
  open
}) => {
  return /* @__PURE__ */ jsx(
    Tooltip.Root,
    {
      delayDuration: openDelayDuration,
      defaultOpen,
      onOpenChange,
      open,
      children
    }
  );
};

export { TooltipRoot };
