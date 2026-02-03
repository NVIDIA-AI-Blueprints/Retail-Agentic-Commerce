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
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { GroupTestIds } from '../../constants.js';

const group = cva("nv-group", {
  variants: {
    kind: {
      flush: "",
      gap: "nv-group--kind-gap",
      border: "nv-group--kind-border"
    }
  },
  defaultVariants: {
    kind: "flush"
  }
});
const Group = forwardRef(
  ({ className, kind, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      Primitive.div,
      {
        ...mergeProps(
          {
            className: group({ className, kind }),
            "data-testid": GroupTestIds.Group,
            ref
          },
          props
        )
      }
    );
  }
);
Group.displayName = "Group";

export { Group };
