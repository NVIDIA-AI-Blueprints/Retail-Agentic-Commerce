/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx, jsxs } from 'react/jsx-runtime';
// foundations-css import removed
import { NotificationTestIds } from '../../index.js';
import { Button } from '../../../Button/index.js';
import { Icon } from '../../../lib/components/Icon.js';
import { NotificationCloseButtonSection } from '../composed/NotificationCloseButtonSection.js';
import { NotificationContent } from '../composed/NotificationContent.js';
import { NotificationFooter } from '../composed/NotificationFooter.js';
import { NotificationHeader } from '../composed/NotificationHeader.js';
import { NotificationHeading } from '../composed/NotificationHeading.js';
import { NotificationIcon } from '../composed/NotificationIcon.js';
import { NotificationRoot } from '../composed/NotificationRoot.js';
import { NotificationSubheading } from '../composed/NotificationSubheading.js';

const Notification = ({
  children,
  className,
  kind,
  onClose,
  slotCloseIcon = /* @__PURE__ */ jsx(Icon, { name: "close" }),
  slotFooter,
  slotHeading,
  slotIcon,
  slotSubheading,
  ...props
}) => {
  return /* @__PURE__ */ jsx(NotificationRoot, { className, kind, ...props, children: /* @__PURE__ */ jsxs(NotificationContent, { ...props.attributes?.NotificationContent, children: [
    /* @__PURE__ */ jsx(
      NotificationIcon,
      {
        status: props.status,
        ...props.attributes?.NotificationIcon,
        children: slotIcon
      }
    ),
    /* @__PURE__ */ jsxs(NotificationHeader, { ...props.attributes?.NotificationHeader, children: [
      /* @__PURE__ */ jsx(NotificationHeading, { ...props.attributes?.NotificationHeading, children: children ?? slotHeading }),
      slotSubheading && /* @__PURE__ */ jsx(
        NotificationSubheading,
        {
          ...props.attributes?.NotificationSubheading,
          children: slotSubheading
        }
      )
    ] }),
    onClose && /* @__PURE__ */ jsx(NotificationCloseButtonSection, { children: /* @__PURE__ */ jsx(
      Button,
      {
        "aria-label": "Dismiss notification",
        color: "neutral",
        "data-testid": NotificationTestIds.NotificationCloseButton,
        kind: "tertiary",
        onClick: onClose,
        ...props.attributes?.NotificationCloseButton,
        children: slotCloseIcon
      }
    ) }),
    slotFooter && /* @__PURE__ */ jsx(NotificationFooter, { ...props.attributes?.NotificationFooter, children: slotFooter })
  ] }) });
};
Notification.displayName = "Notification";

export { Notification };
