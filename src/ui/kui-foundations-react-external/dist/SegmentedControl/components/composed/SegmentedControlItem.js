/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { Item } from '@radix-ui/react-toggle-group';
import { cva } from 'class-variance-authority';
import { Button } from '../../../Button/index.js';
import { SegmentedControlTestIds } from '../../constants.js';

const segmentedControlItem = cva("nv-segmented-control-item", {
  variants: {
    selected: {
      true: "nv-segmented-control-item--selected",
      false: ""
    }
  }
});
const SegmentedControlItem = forwardRef(({ className, selected, children, value, ...props }, ref) => /* @__PURE__ */ jsx(Item, { value, asChild: true, children: /* @__PURE__ */ jsx(
  Button,
  {
    color: "neutral",
    kind: "tertiary",
    ...props,
    className: segmentedControlItem({ className, selected }),
    ref,
    "data-testid": SegmentedControlTestIds.SegmentedControlItem,
    children
  }
) }));
SegmentedControlItem.displayName = Item.displayName;

export { SegmentedControlItem };
