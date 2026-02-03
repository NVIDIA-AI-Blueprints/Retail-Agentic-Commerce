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
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const notificationCloseButtonSection = classVarianceAuthority.cva(
  "nv-notification-close-button-section"
);
const NotificationCloseButtonSection = React__default.default.forwardRef(function NotificationCloseButtonSection2({ className, ...props }, ref) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    primitive.Primitive.div,
    {
      ...mergeProps.mergeProps(
        {
          className: notificationCloseButtonSection({ className }),
          "data-testid": constants.NotificationTestIds.NotificationCloseButtonSection,
          ref
        },
        props
      )
    }
  );
});

exports.NotificationCloseButtonSection = NotificationCloseButtonSection;
