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
import { NotificationTestIds } from '../../constants.js';

const notificationHeading = cva("nv-notification-heading");
const NotificationHeading = forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    Primitive.div,
    {
      ...mergeProps(
        {
          className: notificationHeading({ className }),
          ref,
          "data-testid": NotificationTestIds.NotificationHeading
        },
        props
      )
    }
  );
});
NotificationHeading.displayName = "NotificationHeading";

export { NotificationHeading };
