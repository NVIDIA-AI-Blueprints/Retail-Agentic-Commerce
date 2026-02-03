/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
// foundations-css import removed
var __ = require('../../index.cjs');
var Button = require('../../../Button/index.cjs');
var Icon = require('../../../lib/components/Icon.cjs');
var NotificationCloseButtonSection = require('../composed/NotificationCloseButtonSection.cjs');
var NotificationContent = require('../composed/NotificationContent.cjs');
var NotificationFooter = require('../composed/NotificationFooter.cjs');
var NotificationHeader = require('../composed/NotificationHeader.cjs');
var NotificationHeading = require('../composed/NotificationHeading.cjs');
var NotificationIcon = require('../composed/NotificationIcon.cjs');
var NotificationRoot = require('../composed/NotificationRoot.cjs');
var NotificationSubheading = require('../composed/NotificationSubheading.cjs');

const Notification = ({
  children,
  className,
  kind,
  onClose,
  slotCloseIcon = /* @__PURE__ */ jsxRuntime.jsx(Icon.Icon, { name: "close" }),
  slotFooter,
  slotHeading,
  slotIcon,
  slotSubheading,
  ...props
}) => {
  return /* @__PURE__ */ jsxRuntime.jsx(NotificationRoot.NotificationRoot, { className, kind, ...props, children: /* @__PURE__ */ jsxRuntime.jsxs(NotificationContent.NotificationContent, { ...props.attributes?.NotificationContent, children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      NotificationIcon.NotificationIcon,
      {
        status: props.status,
        ...props.attributes?.NotificationIcon,
        children: slotIcon
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsxs(NotificationHeader.NotificationHeader, { ...props.attributes?.NotificationHeader, children: [
      /* @__PURE__ */ jsxRuntime.jsx(NotificationHeading.NotificationHeading, { ...props.attributes?.NotificationHeading, children: children ?? slotHeading }),
      slotSubheading && /* @__PURE__ */ jsxRuntime.jsx(
        NotificationSubheading.NotificationSubheading,
        {
          ...props.attributes?.NotificationSubheading,
          children: slotSubheading
        }
      )
    ] }),
    onClose && /* @__PURE__ */ jsxRuntime.jsx(NotificationCloseButtonSection.NotificationCloseButtonSection, { children: /* @__PURE__ */ jsxRuntime.jsx(
      Button.Button,
      {
        "aria-label": "Dismiss notification",
        color: "neutral",
        "data-testid": __.NotificationTestIds.NotificationCloseButton,
        kind: "tertiary",
        onClick: onClose,
        ...props.attributes?.NotificationCloseButton,
        children: slotCloseIcon
      }
    ) }),
    slotFooter && /* @__PURE__ */ jsxRuntime.jsx(NotificationFooter.NotificationFooter, { ...props.attributes?.NotificationFooter, children: slotFooter })
  ] }) });
};
Notification.displayName = "Notification";

exports.Notification = Notification;
