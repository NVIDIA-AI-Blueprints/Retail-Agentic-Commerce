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

const tabsContent = cva("nv-tabs-content");
const TabsContent = React.forwardRef(
  ({ className, value, ...props }, ref) => {
    return /* @__PURE__ */ jsx(RadixTabs.Content, { asChild: true, value, children: /* @__PURE__ */ jsx(
      Primitive.div,
      {
        ...mergeProps(
          {
            className: tabsContent({ className }),
            ref,
            "data-testid": TabsTestIds.TabsContent
          },
          props
        )
      }
    ) });
  }
);
TabsContent.displayName = "TabsContent";

export { TabsContent };
