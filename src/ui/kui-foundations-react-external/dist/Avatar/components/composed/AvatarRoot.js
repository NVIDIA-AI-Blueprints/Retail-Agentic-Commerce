/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import React from 'react';
import * as RadixAvatar from '@radix-ui/react-avatar';
import { cva } from 'class-variance-authority';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { AvatarTestIds } from '../../constants.js';

const avatar = cva("nv-avatar-root", {
  variants: {
    size: {
      small: "nv-avatar-root--size-small",
      medium: "nv-avatar-root--size-medium",
      large: "nv-avatar-root--size-large",
      xlarge: "nv-avatar-root--size-xlarge",
      xxlarge: "nv-avatar-root--size-xxlarge"
    },
    interactive: {
      true: "nv-avatar-root--interactive"
    },
    kind: {
      outline: "nv-avatar-root--kind-outline",
      solid: ""
    }
  },
  defaultVariants: {
    size: "medium",
    kind: "outline"
  }
});
const AvatarRoot = React.forwardRef(
  ({ className, size, kind, interactive, ...props }, ref) => {
    const isInteractive = interactive !== void 0 ? interactive : !!props.onClick;
    return /* @__PURE__ */ jsx(RadixAvatar.Avatar, { asChild: true, children: /* @__PURE__ */ jsx(
      Primitive.div,
      {
        ...mergeProps(
          {
            className: avatar({
              className,
              size,
              kind,
              interactive: isInteractive
            }),
            "data-testid": AvatarTestIds.AvatarRoot,
            ref
          },
          props
        )
      }
    ) });
  }
);
AvatarRoot.displayName = "AvatarRoot";

export { AvatarRoot };
