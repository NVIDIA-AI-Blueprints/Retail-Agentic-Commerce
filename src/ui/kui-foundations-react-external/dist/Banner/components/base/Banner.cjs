/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
var react = require('react');
var Button = require('../../../Button/index.cjs');
var Icon = require('../../../lib/components/Icon.cjs');
var constants = require('../../constants.cjs');
var BannerActionsSection = require('../composed/BannerActionsSection.cjs');
var BannerCloseButtonSection = require('../composed/BannerCloseButtonSection.cjs');
var BannerContent = require('../composed/BannerContent.cjs');
var BannerHeader = require('../composed/BannerHeader.cjs');
var BannerHeading = require('../composed/BannerHeading.cjs');
var BannerIcon = require('../composed/BannerIcon.cjs');
var BannerLayout = require('../composed/BannerLayout.cjs');
var BannerRoot = require('../composed/BannerRoot.cjs');
var BannerSubheading = require('../composed/BannerSubheading.cjs');

const Banner = react.forwardRef(
  ({
    children,
    kind = "inline",
    status = "info",
    slotIcon = status === "info" ? /* @__PURE__ */ jsxRuntime.jsx(Icon.Icon, { name: "info-circle" }) : status === "warning" ? /* @__PURE__ */ jsxRuntime.jsx(Icon.Icon, { name: "warning" }) : status === "error" ? /* @__PURE__ */ jsxRuntime.jsx(Icon.Icon, { name: "error" }) : status === "success" ? /* @__PURE__ */ jsxRuntime.jsx(Icon.Icon, { name: "check" }) : null,
    slotHeading,
    slotSubheading,
    actionsPosition,
    slotActions,
    onClose,
    attributes,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      BannerRoot.BannerRoot,
      {
        kind,
        status,
        actionsPosition,
        ref,
        ...props,
        children: /* @__PURE__ */ jsxRuntime.jsxs(BannerLayout.BannerLayout, { children: [
          /* @__PURE__ */ jsxRuntime.jsxs(BannerContent.BannerContent, { ...attributes?.BannerContent, children: [
            slotIcon && /* @__PURE__ */ jsxRuntime.jsx(BannerIcon.BannerIcon, { ...attributes?.BannerIcon, children: slotIcon }),
            /* @__PURE__ */ jsxRuntime.jsxs(BannerHeader.BannerHeader, { ...attributes?.BannerHeader, children: [
              (children ?? slotHeading) && /* @__PURE__ */ jsxRuntime.jsx(BannerHeading.BannerHeading, { ...attributes?.BannerHeading, children: children ?? slotHeading }),
              kind === "header" && slotSubheading && /* @__PURE__ */ jsxRuntime.jsx(BannerSubheading.BannerSubheading, { ...attributes?.BannerSubheading, children: slotSubheading })
            ] })
          ] }),
          slotActions && /* @__PURE__ */ jsxRuntime.jsx(BannerActionsSection.BannerActionsSection, { children: slotActions }),
          onClose && /* @__PURE__ */ jsxRuntime.jsx(BannerCloseButtonSection.BannerCloseButtonSection, { children: /* @__PURE__ */ jsxRuntime.jsx(
            Button.Button,
            {
              color: "neutral",
              kind: "tertiary",
              size: "tiny",
              onClick: onClose,
              "data-testid": constants.BannerTestIds.BannerCloseButton,
              "aria-label": "close-button",
              ...attributes?.BannerCloseButton,
              children: /* @__PURE__ */ jsxRuntime.jsx(Icon.Icon, { name: "close", size: "12" })
            }
          ) })
        ] })
      }
    );
  }
);
Banner.displayName = "Banner";

exports.Banner = Banner;
