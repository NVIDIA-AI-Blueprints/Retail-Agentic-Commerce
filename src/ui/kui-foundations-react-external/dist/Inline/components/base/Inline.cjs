/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const Inline = React__default.default.forwardRef(
  ({
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
    spacingLeft,
    ...spanProps
  }, ref) => /* @__PURE__ */ jsxRuntime.jsx(
    primitive.Primitive.span,
    {
      ...mergeProps.mergeProps(
        {
          className: primitive.primitive({
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
          ref,
          "data-testid": constants.InlineTestIds.Inline
        },
        spanProps
      )
    }
  )
);
Inline.displayName = "Inline";

exports.Inline = Inline;
