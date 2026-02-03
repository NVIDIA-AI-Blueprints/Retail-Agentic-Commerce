/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import * as RadixSwitch from '@radix-ui/react-switch';
import { cva } from 'class-variance-authority';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { SwitchTestIds } from '../../constants.js';

const switchThumb = cva("nv-switch-thumb");
const SwitchThumb = forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(RadixSwitch.Thumb, { asChild: true, children: /* @__PURE__ */ jsx(
      Primitive.span,
      {
        ...mergeProps(
          {
            className: switchThumb({ className }),
            ref,
            "data-testid": SwitchTestIds.Thumb
          },
          props
        )
      }
    ) });
  }
);
SwitchThumb.displayName = "SwitchThumb";

export { SwitchThumb };
