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
import { ListTestIds } from '../../constants.js';

const listRoot = cva("nv-list-root", {
  variants: { kind: { ordered: "nv-list-root--kind-ordered", unordered: "" } }
});
const ListRoot = forwardRef(({ className, kind, ...props }, ref) => {
  const Component = kind === "ordered" ? Primitive.ol : Primitive.ul;
  return /* @__PURE__ */ jsx(
    Component,
    {
      ...mergeProps(
        {
          className: listRoot({ className, kind }),
          ref,
          "data-testid": ListTestIds.ListRoot
        },
        props
      )
    }
  );
});
ListRoot.displayName = "ListRoot";

export { ListRoot };
