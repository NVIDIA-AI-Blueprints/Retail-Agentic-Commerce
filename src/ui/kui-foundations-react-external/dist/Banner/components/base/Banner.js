/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx, jsxs } from 'react/jsx-runtime';
import { forwardRef } from 'react';
import { Button } from '../../../Button/index.js';
import { Icon } from '../../../lib/components/Icon.js';
import { BannerTestIds } from '../../constants.js';
import { BannerActionsSection } from '../composed/BannerActionsSection.js';
import { BannerCloseButtonSection } from '../composed/BannerCloseButtonSection.js';
import { BannerContent } from '../composed/BannerContent.js';
import { BannerHeader } from '../composed/BannerHeader.js';
import { BannerHeading } from '../composed/BannerHeading.js';
import { BannerIcon } from '../composed/BannerIcon.js';
import { BannerLayout } from '../composed/BannerLayout.js';
import { BannerRoot } from '../composed/BannerRoot.js';
import { BannerSubheading } from '../composed/BannerSubheading.js';

const Banner = forwardRef(
  ({
    children,
    kind = "inline",
    status = "info",
    slotIcon = status === "info" ? /* @__PURE__ */ jsx(Icon, { name: "info-circle" }) : status === "warning" ? /* @__PURE__ */ jsx(Icon, { name: "warning" }) : status === "error" ? /* @__PURE__ */ jsx(Icon, { name: "error" }) : status === "success" ? /* @__PURE__ */ jsx(Icon, { name: "check" }) : null,
    slotHeading,
    slotSubheading,
    actionsPosition,
    slotActions,
    onClose,
    attributes,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsx(
      BannerRoot,
      {
        kind,
        status,
        actionsPosition,
        ref,
        ...props,
        children: /* @__PURE__ */ jsxs(BannerLayout, { children: [
          /* @__PURE__ */ jsxs(BannerContent, { ...attributes?.BannerContent, children: [
            slotIcon && /* @__PURE__ */ jsx(BannerIcon, { ...attributes?.BannerIcon, children: slotIcon }),
            /* @__PURE__ */ jsxs(BannerHeader, { ...attributes?.BannerHeader, children: [
              (children ?? slotHeading) && /* @__PURE__ */ jsx(BannerHeading, { ...attributes?.BannerHeading, children: children ?? slotHeading }),
              kind === "header" && slotSubheading && /* @__PURE__ */ jsx(BannerSubheading, { ...attributes?.BannerSubheading, children: slotSubheading })
            ] })
          ] }),
          slotActions && /* @__PURE__ */ jsx(BannerActionsSection, { children: slotActions }),
          onClose && /* @__PURE__ */ jsx(BannerCloseButtonSection, { children: /* @__PURE__ */ jsx(
            Button,
            {
              color: "neutral",
              kind: "tertiary",
              size: "tiny",
              onClick: onClose,
              "data-testid": BannerTestIds.BannerCloseButton,
              "aria-label": "close-button",
              ...attributes?.BannerCloseButton,
              children: /* @__PURE__ */ jsx(Icon, { name: "close", size: "12" })
            }
          ) })
        ] })
      }
    );
  }
);
Banner.displayName = "Banner";

export { Banner };
