/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
import React from 'react';
import * as RadixAvatar from '@radix-ui/react-avatar';
import { cva } from 'class-variance-authority';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { AvatarTestIds } from '../../constants.js';

const avatarFallback = cva("nv-avatar-fallback");
const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(RadixAvatar.Fallback, { asChild: true, children: /* @__PURE__ */ jsx(
    Primitive.div,
    {
      ...mergeProps(
        {
          className: avatarFallback({ className }),
          "data-testid": AvatarTestIds.AvatarFallback,
          ref
        },
        props
      )
    }
  ) });
});
AvatarFallback.displayName = "AvatarFallback";

export { AvatarFallback };
