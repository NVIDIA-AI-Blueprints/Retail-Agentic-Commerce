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
import { NotificationTestIds } from '../../constants.js';

const notificationCloseButtonSection = cva(
  "nv-notification-close-button-section"
);
const NotificationCloseButtonSection = React.forwardRef(function NotificationCloseButtonSection2({ className, ...props }, ref) {
  return /* @__PURE__ */ jsx(
    Primitive.div,
    {
      ...mergeProps(
        {
          className: notificationCloseButtonSection({ className }),
          "data-testid": NotificationTestIds.NotificationCloseButtonSection,
          ref
        },
        props
      )
    }
  );
});

export { NotificationCloseButtonSection };
