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
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var AppBarLogo = require('../composed/AppBarLogo.cjs');

const appbar = classVarianceAuthority.cva("nv-app-bar-root");
const AppBar = react.forwardRef(
  ({
    className,
    slotExpander,
    slotLeft = /* @__PURE__ */ jsxRuntime.jsx(AppBarLogo.AppBarLogo, {}),
    slotCenter,
    slotRight,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        ...mergeProps.mergeProps(
          {
            className: appbar({ className }),
            ref,
            "data-testid": constants.AppBarTestIds.AppBarRoot
          },
          props
        ),
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs(
            "div",
            {
              className: "nv-app-bar-slot-left",
              "data-testid": constants.AppBarTestIds.AppBarSlotLeft,
              children: [
                slotExpander,
                slotLeft
              ]
            }
          ),
          slotCenter && /* @__PURE__ */ jsxRuntime.jsx(
            "div",
            {
              className: "nv-app-bar-slot-center",
              "data-testid": constants.AppBarTestIds.AppBarSlotCenter,
              children: slotCenter
            }
          ),
          slotRight && /* @__PURE__ */ jsxRuntime.jsx(
            "div",
            {
              className: "nv-app-bar-slot-right",
              "data-testid": constants.AppBarTestIds.AppBarSlotRight,
              children: slotRight
            }
          )
        ]
      }
    );
  }
);
AppBar.displayName = "AppBar";

exports.AppBar = AppBar;
