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

const listItem = cva("nv-list-item");
const ListItem = forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      Primitive.li,
      {
        ...mergeProps(
          {
            className: listItem({ className }),
            ref,
            "data-testid": ListTestIds.ListItem
          },
          props
        )
      }
    );
  }
);
ListItem.displayName = "ListItem";

export { ListItem };
