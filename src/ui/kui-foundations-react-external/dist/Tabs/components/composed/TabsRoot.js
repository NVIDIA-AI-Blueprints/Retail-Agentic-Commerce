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

const tabsRoot = cva("nv-tabs-root");
const TabsRoot = React.forwardRef(
  ({ value, defaultValue, onValueChange, className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      RadixTabs.Root,
      {
        value,
        defaultValue,
        onValueChange,
        asChild: true,
        children: /* @__PURE__ */ jsx(
          Primitive.div,
          {
            ...mergeProps(
              {
                ref,
                "data-testid": TabsTestIds.TabsRoot,
                className: tabsRoot({ className })
              },
              props
            )
          }
        )
      }
    );
  }
);
TabsRoot.displayName = "TabsRoot";

export { TabsRoot };
