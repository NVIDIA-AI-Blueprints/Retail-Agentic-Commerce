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
var __ = require('../../index.cjs');
var Button = require('../../../Button/index.cjs');
var Icon = require('../../../lib/components/Icon.cjs');
var ToastActions = require('../composed/ToastActions.cjs');
var ToastContent = require('../composed/ToastContent.cjs');
var ToastIcon = require('../composed/ToastIcon.cjs');
var ToastRoot = require('../composed/ToastRoot.cjs');
var ToastText = require('../composed/ToastText.cjs');

const Toast = react.forwardRef(
  ({ status, onClose, slotAction, slotIcon, children, attributes, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsxs(ToastRoot.ToastRoot, { ...props, status, ref, children: [
      /* @__PURE__ */ jsxRuntime.jsxs(ToastContent.ToastContent, { ...attributes?.ToastContent, children: [
        slotIcon || /* @__PURE__ */ jsxRuntime.jsx(ToastIcon.ToastIcon, { status, ...attributes?.ToastIcon }),
        /* @__PURE__ */ jsxRuntime.jsx(ToastText.ToastText, { ...attributes?.ToastText, children })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs(ToastActions.ToastActions, { ...attributes?.ToastActions, children: [
        slotAction,
        onClose && /* @__PURE__ */ jsxRuntime.jsx(
          Button.Button,
          {
            color: "neutral",
            kind: "tertiary",
            size: "small",
            onClick: onClose,
            "data-testid": __.ToastTestIds.ToastCloseButton,
            "aria-label": "Close",
            ...attributes?.ToastCloseButton,
            children: /* @__PURE__ */ jsxRuntime.jsx(Icon.Icon, { name: "close" })
          }
        )
      ] })
    ] });
  }
);
Toast.displayName = "Toast";

exports.Toast = Toast;
