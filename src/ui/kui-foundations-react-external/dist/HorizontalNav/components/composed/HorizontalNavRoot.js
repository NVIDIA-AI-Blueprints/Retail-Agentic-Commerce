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
import { TabsRoot } from '../../../Tabs/index.js';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { HorizontalNavTestIds } from '../../constants.js';

const horizontalNavRoot = cva("nv-horizontal-nav-root");
const HorizontalNavRoot = forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    TabsRoot,
    {
      value: props.value,
      defaultValue: props.defaultValue,
      onValueChange: props.onValueChange,
      asChild: true,
      children: /* @__PURE__ */ jsx(
        Primitive.nav,
        {
          ...mergeProps(
            {
              className: horizontalNavRoot({ className }),
              ref,
              "data-testid": HorizontalNavTestIds.HorizontalNavRoot
            },
            props
          )
        }
      )
    }
  );
});
HorizontalNavRoot.displayName = "HorizontalNavRoot";

export { HorizontalNavRoot };
