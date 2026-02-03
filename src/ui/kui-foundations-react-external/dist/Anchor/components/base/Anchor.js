/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { cva, cx } from 'class-variance-authority';
import { Text } from '../../../Text/index.js';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { AnchorTestIds } from '../../constants.js';

const anchor = cva("nv-anchor", {
  variants: {
    kind: {
      inline: "",
      // default
      standalone: "nv-anchor--kind-standalone"
    },
    disabled: {
      true: "nv-anchor--disabled"
    }
  }
});
const Anchor = forwardRef(
  ({
    className,
    kind,
    disabled,
    textKind = "body/regular/md",
    fontFamily,
    fontWeight,
    fontStyle,
    fontSize,
    lineHeight,
    underline,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsx(
      Text,
      {
        asChild: true,
        kind: textKind,
        fontFamily,
        fontWeight,
        fontStyle,
        fontSize,
        lineHeight,
        underline,
        children: /* @__PURE__ */ jsx(
          Primitive.a,
          {
            ...mergeProps(
              {
                className: cx(anchor({ className, kind, disabled })),
                ref,
                "data-testid": AnchorTestIds.Anchor,
                "aria-disabled": !!disabled
              },
              props
            )
          }
        )
      }
    );
  }
);
Anchor.displayName = "Anchor";

export { Anchor };
