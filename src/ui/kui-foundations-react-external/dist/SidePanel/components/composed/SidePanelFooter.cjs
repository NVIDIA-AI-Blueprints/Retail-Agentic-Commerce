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

const sidePanelFooter = classVarianceAuthority.cva("nv-side-panel-footer");
const SidePanelFooter = react.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.div,
      {
        ...mergeProps.mergeProps(
          {
            className: sidePanelFooter({ className }),
            ref,
            "data-testid": constants.SidePanelTestIds.SidePanelFooter
          },
          props
        )
      }
    );
  }
);
SidePanelFooter.displayName = "SidePanelFooter";

exports.SidePanelFooter = SidePanelFooter;
