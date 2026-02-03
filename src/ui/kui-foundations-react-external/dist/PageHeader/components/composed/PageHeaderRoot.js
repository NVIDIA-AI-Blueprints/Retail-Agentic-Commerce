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
import { densityVariant } from '../../../lib/constants/density.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { PageHeaderTestIds } from '../../constants.js';

const pageHeaderRoot = cva("nv-page-header-root", {
  variants: {
    density: densityVariant,
    kind: {
      floating: "nv-page-header-root--kind-floating",
      flat: ""
    }
  },
  defaultVariants: {
    kind: "flat"
  }
});
const PageHeaderRoot = forwardRef(
  ({ className, kind, density, ...props }, ref) => {
    return /* @__PURE__ */ jsx("div", { className: "nv-inline-container", children: /* @__PURE__ */ jsx(
      Primitive.div,
      {
        ...mergeProps(
          {
            className: pageHeaderRoot({ className, kind, density }),
            ref,
            "data-testid": PageHeaderTestIds.PageHeaderRoot
          },
          props
        )
      }
    ) });
  }
);
PageHeaderRoot.displayName = "PageHeaderRoot";

export { PageHeaderRoot };
