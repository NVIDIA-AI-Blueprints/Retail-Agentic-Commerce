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

const avatarImage = cva("nv-avatar-image");
const AvatarImage = React.forwardRef(
  ({ className, src, alt, ...props }, ref) => {
    return /* @__PURE__ */ jsx(RadixAvatar.Image, { asChild: true, src, alt, children: /* @__PURE__ */ jsx(
      Primitive.img,
      {
        ...mergeProps(
          {
            className: avatarImage({ className }),
            "data-testid": AvatarTestIds.AvatarImage,
            ref
          },
          props
        )
      }
    ) });
  }
);
AvatarImage.displayName = "AvatarImage";

export { AvatarImage };
