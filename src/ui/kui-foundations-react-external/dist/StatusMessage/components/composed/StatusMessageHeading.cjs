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

const statusMessageHeading = classVarianceAuthority.cva("nv-status-message-heading");
const StatusMessageHeading = react.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    primitive.Primitive.div,
    {
      ...mergeProps.mergeProps(
        {
          className: statusMessageHeading({ className }),
          ref,
          "data-testid": constants.StatusMessageTestIds.StatusMessageHeading
        },
        props
      )
    }
  );
});
StatusMessageHeading.displayName = "StatusMessageHeading";

exports.StatusMessageHeading = StatusMessageHeading;
