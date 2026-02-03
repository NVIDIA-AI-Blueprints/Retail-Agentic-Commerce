/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
import React from 'react';
import { cva } from 'class-variance-authority';
import { Icon } from '../../../lib/components/Icon.js';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';

const breadcrumbsSeparator = cva("nv-breadcrumbs-separator");
const BreadcrumbsSeparator = React.forwardRef(({ children = /* @__PURE__ */ jsx(Icon, { name: "chevron-right" }), className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    Primitive.div,
    {
      ...mergeProps(
        { className: breadcrumbsSeparator({ className }), ref },
        props
      ),
      children
    }
  );
});
BreadcrumbsSeparator.displayName = "BreadcrumbsSeparator";

export { BreadcrumbsSeparator };
