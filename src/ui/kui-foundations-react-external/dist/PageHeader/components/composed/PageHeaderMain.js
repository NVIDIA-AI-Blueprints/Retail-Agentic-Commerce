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
import { PageHeaderTestIds } from '../../constants.js';

const pageHeaderMain = cva("nv-page-header-main");
const PageHeaderMain = forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      Primitive.div,
      {
        ...mergeProps(
          {
            className: pageHeaderMain({ className }),
            ref,
            "data-testid": PageHeaderTestIds.PageHeaderMain
          },
          props
        )
      }
    );
  }
);
PageHeaderMain.displayName = "PageHeaderMain";

export { PageHeaderMain };
