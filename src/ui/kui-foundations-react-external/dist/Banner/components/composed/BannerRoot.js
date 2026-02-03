/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import React from 'react';
import { cva } from 'class-variance-authority';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { BannerTestIds } from '../../constants.js';

const bannerRoot = cva("nv-banner-root", {
  variants: {
    status: {
      error: "nv-banner-root--status-error",
      warning: "nv-banner-root--status-warning",
      success: "nv-banner-root--status-success",
      info: ""
    },
    kind: {
      global: "nv-banner-root--kind-global",
      header: "nv-banner-root--kind-header",
      inline: ""
    },
    actionsPosition: {
      right: "nv-banner-root--actionsPosition-right",
      bottom: "nv-banner-root--actionsPosition-bottom"
    }
  }
});
const BannerRoot = React.forwardRef(
  ({ className, kind, status, actionsPosition, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      Primitive.div,
      {
        ...mergeProps(
          {
            className: bannerRoot({
              className,
              kind,
              status,
              actionsPosition
            }),
            "data-testid": BannerTestIds.BannerRoot,
            ref
          },
          props
        )
      }
    );
  }
);
BannerRoot.displayName = "BannerRoot";

export { BannerRoot };
