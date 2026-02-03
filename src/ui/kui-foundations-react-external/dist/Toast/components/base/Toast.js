/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsxs, jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { ToastTestIds } from '../../index.js';
import { Button } from '../../../Button/index.js';
import { Icon } from '../../../lib/components/Icon.js';
import { ToastActions } from '../composed/ToastActions.js';
import { ToastContent } from '../composed/ToastContent.js';
import { ToastIcon } from '../composed/ToastIcon.js';
import { ToastRoot } from '../composed/ToastRoot.js';
import { ToastText } from '../composed/ToastText.js';

const Toast = forwardRef(
  ({ status, onClose, slotAction, slotIcon, children, attributes, ...props }, ref) => {
    return /* @__PURE__ */ jsxs(ToastRoot, { ...props, status, ref, children: [
      /* @__PURE__ */ jsxs(ToastContent, { ...attributes?.ToastContent, children: [
        slotIcon || /* @__PURE__ */ jsx(ToastIcon, { status, ...attributes?.ToastIcon }),
        /* @__PURE__ */ jsx(ToastText, { ...attributes?.ToastText, children })
      ] }),
      /* @__PURE__ */ jsxs(ToastActions, { ...attributes?.ToastActions, children: [
        slotAction,
        onClose && /* @__PURE__ */ jsx(
          Button,
          {
            color: "neutral",
            kind: "tertiary",
            size: "small",
            onClick: onClose,
            "data-testid": ToastTestIds.ToastCloseButton,
            "aria-label": "Close",
            ...attributes?.ToastCloseButton,
            children: /* @__PURE__ */ jsx(Icon, { name: "close" })
          }
        )
      ] })
    ] });
  }
);
Toast.displayName = "Toast";

export { Toast };
