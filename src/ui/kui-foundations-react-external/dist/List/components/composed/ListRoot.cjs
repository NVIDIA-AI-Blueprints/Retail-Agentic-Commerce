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
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

const listRoot = classVarianceAuthority.cva("nv-list-root", {
  variants: { kind: { ordered: "nv-list-root--kind-ordered", unordered: "" } }
});
const ListRoot = react.forwardRef(({ className, kind, ...props }, ref) => {
  const Component = kind === "ordered" ? primitive.Primitive.ol : primitive.Primitive.ul;
  return /* @__PURE__ */ jsxRuntime.jsx(
    Component,
    {
      ...mergeProps.mergeProps(
        {
          className: listRoot({ className, kind }),
          ref,
          "data-testid": constants.ListTestIds.ListRoot
        },
        props
      )
    }
  );
});
ListRoot.displayName = "ListRoot";

exports.ListRoot = ListRoot;
