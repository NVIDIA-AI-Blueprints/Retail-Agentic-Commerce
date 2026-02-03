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

const switchTrack = cva("nv-switch-track");
const SwitchTrack = forwardRef(
  ({ disabled, checked, defaultChecked, onCheckedChange, className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      RadixSwitch.Root,
      {
        disabled,
        checked,
        defaultChecked,
        onCheckedChange,
        asChild: true,
        children: /* @__PURE__ */ jsx(
          Primitive.button,
          {
            ...mergeProps(
              {
                className: switchTrack({ className }),
                ref,
                "data-testid": SwitchTestIds.Track
              },
              props
            )
          }
        )
      }
    );
  }
);
SwitchTrack.displayName = "SwitchTrack";

export { SwitchTrack };
