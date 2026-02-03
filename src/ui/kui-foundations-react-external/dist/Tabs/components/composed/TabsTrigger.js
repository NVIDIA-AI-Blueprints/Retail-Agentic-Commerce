/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import React from 'react';
import * as RadixTabs from '@radix-ui/react-tabs';
import { cva } from 'class-variance-authority';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { TabsTestIds } from '../../constants.js';

const tabsTrigger = cva("nv-tabs-trigger");
const TabsTrigger = React.forwardRef(({ className, value, disabled, ...props }, ref) => {
  return /* @__PURE__ */ jsx(RadixTabs.Trigger, { asChild: true, value, disabled, children: /* @__PURE__ */ jsx(
    Primitive.button,
    {
      ...mergeProps(
        {
          className: tabsTrigger({ className }),
          ref,
          "data-testid": TabsTestIds.TabsTrigger
        },
        props
      )
    }
  ) });
});
TabsTrigger.displayName = "TabsTrigger";

export { TabsTrigger };
