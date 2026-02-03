/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
// foundations-css import removed
var react = require('react');
var classVarianceAuthority = require('class-variance-authority');
var Text = require('../../../Text/index.cjs');
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

const anchor = classVarianceAuthority.cva("nv-anchor", {
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
const Anchor = react.forwardRef(
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
    return /* @__PURE__ */ jsxRuntime.jsx(
      Text.Text,
      {
        asChild: true,
        kind: textKind,
        fontFamily,
        fontWeight,
        fontStyle,
        fontSize,
        lineHeight,
        underline,
        children: /* @__PURE__ */ jsxRuntime.jsx(
          primitive.Primitive.a,
          {
            ...mergeProps.mergeProps(
              {
                className: classVarianceAuthority.cx(anchor({ className, kind, disabled })),
                ref,
                "data-testid": constants.AnchorTestIds.Anchor,
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

exports.Anchor = Anchor;
