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
import { SkeletonTestIds } from '../../constants.js';

const skeleton = cva("nv-skeleton", {
  variants: {
    kind: {
      line: "",
      pill: "nv-skeleton--kind-pill",
      circle: "nv-skeleton--kind-circle"
    },
    animated: {
      true: "nv-skeleton--animated"
    }
  },
  defaultVariants: {
    kind: "line",
    animated: true
  }
});
const Skeleton = forwardRef(
  ({ className, animated, kind, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      Primitive.div,
      {
        ...mergeProps(
          {
            className: skeleton({ className, kind, animated }),
            ref,
            "data-testid": SkeletonTestIds.Skeleton
          },
          props
        )
      }
    );
  }
);
Skeleton.displayName = "Skeleton";

export { Skeleton };
