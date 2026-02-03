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

const statusMessageMedia = classVarianceAuthority.cva("nv-status-message-media");
const StatusMessageMedia = react.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    primitive.Primitive.div,
    {
      ...mergeProps.mergeProps(
        {
          className: statusMessageMedia({ className }),
          ref,
          "data-testid": constants.StatusMessageTestIds.StatusMessageMedia
        },
        props
      )
    }
  );
});
StatusMessageMedia.displayName = "StatusMessageMedia";

exports.StatusMessageMedia = StatusMessageMedia;
