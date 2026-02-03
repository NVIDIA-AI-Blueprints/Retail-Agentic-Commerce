/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
// foundations-css import removed
var React = require('react');
var classVarianceAuthority = require('class-variance-authority');
var primitive = require('../../../lib/components/primitive.cjs');
var properties = require('../../../lib/constants/properties.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var variants = require('../../../lib/utils/variants.cjs');
var constants = require('../../constants.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const block = classVarianceAuthority.cva("nv-block", {
  variants: {
    overflow: variants.buildVariants("nv-block", "overflow", properties.OverflowValues),
    overflowX: variants.buildVariants("nv-block", "overflow-x", properties.OverflowValues),
    overflowY: variants.buildVariants("nv-block", "overflow-y", properties.OverflowValues),
    textOverflow: variants.buildVariants("nv-block", "text", properties.TextOverflowValues),
    textWrap: variants.buildVariants("nv-block", "text", properties.TextWrapValues),
    truncate: {
      true: "nv-block--overflow-hidden nv-block--text-ellipsis nv-block--text-nowrap"
    }
  }
});
const Block = React__default.default.forwardRef(
  ({
    className,
    overflow,
    overflowX,
    overflowY,
    padding,
    paddingX,
    paddingY,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    spacing,
    spacingX,
    spacingY,
    spacingTop,
    spacingRight,
    spacingBottom,
    spacingLeft,
    textOverflow,
    textWrap,
    truncate,
    ...props
  }, ref) => /* @__PURE__ */ jsxRuntime.jsx(
    primitive.Primitive.div,
    {
      ...mergeProps.mergeProps(
        {
          className: classVarianceAuthority.cx(
            primitive.primitive({
              className,
              padding,
              paddingX,
              paddingY,
              paddingTop,
              paddingRight,
              paddingBottom,
              paddingLeft,
              spacing,
              spacingX,
              spacingY,
              spacingTop,
              spacingRight,
              spacingBottom,
              spacingLeft
            }),
            block({
              overflow,
              overflowX,
              overflowY,
              textOverflow,
              textWrap,
              truncate
            })
          ),
          ref,
          "data-testid": constants.BlockTestIds.Block
        },
        props
      )
    }
  )
);
Block.displayName = "Block";

exports.Block = Block;
