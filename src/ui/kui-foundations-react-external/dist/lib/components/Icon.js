/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { mergeProps } from '../utils/merge-props.js';

const icon = cva("nv-icon", {
  variants: {
    variant: {
      line: "",
      fill: "nv-icon--fill"
    }
  }
});
const Icon = forwardRef(
  ({ className, name, variant = "line", size, state, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "i",
      {
        ...mergeProps(
          {
            style: {
              "--icon-font-size": size ? `${size}px` : void 0
            },
            className: `${icon({ className, variant })} nv-icon-${name}`,
            ref,
            role: "img",
            "aria-hidden": props["aria-label"] ? "false" : "true",
            "data-state": state
          },
          props
        )
      }
    );
  }
);
Icon.displayName = "Icon";

export { Icon };
