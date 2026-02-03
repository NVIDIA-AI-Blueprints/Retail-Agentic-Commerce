/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
import React from 'react';
import { cva } from 'class-variance-authority';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';

const breadcrumbsItem = cva("nv-breadcrumbs-item", {
  variants: {
    active: {
      true: "nv-breadcrumbs-item--active"
    }
  },
  defaultVariants: {
    active: false
  }
});
const BreadcrumbsItem = React.forwardRef(({ active = false, className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    Primitive.div,
    {
      ...mergeProps(
        { className: breadcrumbsItem({ active, className }), ref },
        props
      )
    }
  );
});
BreadcrumbsItem.displayName = "BreadcrumbsItem";

export { BreadcrumbsItem };
