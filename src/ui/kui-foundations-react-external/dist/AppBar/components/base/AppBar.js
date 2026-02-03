/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsxs, jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { AppBarTestIds } from '../../constants.js';
import { AppBarLogo } from '../composed/AppBarLogo.js';

const appbar = cva("nv-app-bar-root");
const AppBar = forwardRef(
  ({
    className,
    slotExpander,
    slotLeft = /* @__PURE__ */ jsx(AppBarLogo, {}),
    slotCenter,
    slotRight,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        ...mergeProps(
          {
            className: appbar({ className }),
            ref,
            "data-testid": AppBarTestIds.AppBarRoot
          },
          props
        ),
        children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "nv-app-bar-slot-left",
              "data-testid": AppBarTestIds.AppBarSlotLeft,
              children: [
                slotExpander,
                slotLeft
              ]
            }
          ),
          slotCenter && /* @__PURE__ */ jsx(
            "div",
            {
              className: "nv-app-bar-slot-center",
              "data-testid": AppBarTestIds.AppBarSlotCenter,
              children: slotCenter
            }
          ),
          slotRight && /* @__PURE__ */ jsx(
            "div",
            {
              className: "nv-app-bar-slot-right",
              "data-testid": AppBarTestIds.AppBarSlotRight,
              children: slotRight
            }
          )
        ]
      }
    );
  }
);
AppBar.displayName = "AppBar";

export { AppBar };
