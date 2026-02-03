/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { DialogTitle } from '@radix-ui/react-dialog';
import { cva } from 'class-variance-authority';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { ModalTestIds } from '../../constants.js';
import { useModalContext } from '../../context.js';

const modalHeading = cva("nv-modal-heading", {
  variants: {
    invisible: {
      true: "nv-modal-heading--invisible"
    },
    hidden: {
      true: "nv-modal-heading--hidden"
    }
  },
  defaultVariants: {
    hidden: false
  }
});
const ModalHeading = forwardRef(
  ({ className, children, ...props }, ref) => {
    const context = useModalContext();
    return /* @__PURE__ */ jsx(DialogTitle, { asChild: true, children: /* @__PURE__ */ jsx(
      Primitive.h2,
      {
        ...mergeProps(
          {
            className: modalHeading({
              className,
              invisible: !children && !context.hideCloseButton,
              hidden: !children && context.hideCloseButton
            }),
            ref,
            "data-testid": ModalTestIds.ModalHeading
          },
          props
        ),
        children: !children ? "Modal Content" : children
      }
    ) });
  }
);
ModalHeading.displayName = "ModalHeading";

export { ModalHeading };
