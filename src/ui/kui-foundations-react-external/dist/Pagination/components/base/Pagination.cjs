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
var Divider = require('../../../Divider/index.cjs');
var PaginationArrowButton = require('../composed/PaginationArrowButton.cjs');
var PaginationControlsGroup = require('../composed/PaginationControlsGroup.cjs');
var PaginationItemRangeText = require('../composed/PaginationItemRangeText.cjs');
var PaginationNavigationGroup = require('../composed/PaginationNavigationGroup.cjs');
var PaginationPageInput = require('../composed/PaginationPageInput.cjs');
var PaginationPageList = require('../composed/PaginationPageList.cjs');
var PaginationPageSizeSelect = require('../composed/PaginationPageSizeSelect.cjs');
var PaginationRoot = require('../composed/PaginationRoot.cjs');

const pagination = classVarianceAuthority.cva("nv-pagination", {
  variants: {
    kind: {
      input: "nv-pagination--kind-input",
      tabs: "nv-pagination--kind-tabs",
      simple: "nv-pagination--kind-simple"
    }
  },
  defaultVariants: {
    kind: "input"
  }
});
const Pagination = react.forwardRef(
  ({
    className,
    kind = "input",
    items,
    displayControls = false,
    rangeTextFormatFn,
    renderedItemCount,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsxs(
      PaginationRoot.PaginationRoot,
      {
        className: pagination({ kind, className }),
        ref,
        ...props,
        children: [
          displayControls && /* @__PURE__ */ jsxRuntime.jsxs(PaginationControlsGroup.PaginationControlsGroup, { children: [
            "Items per page",
            /* @__PURE__ */ jsxRuntime.jsx(PaginationPageSizeSelect.PaginationPageSizeSelect, {}),
            /* @__PURE__ */ jsxRuntime.jsx(Divider.Divider, { orientation: "vertical", width: "small" }),
            /* @__PURE__ */ jsxRuntime.jsx(PaginationItemRangeText.PaginationItemRangeText, { rangeTextFormatFn })
          ] }),
          kind === "input" && /* @__PURE__ */ jsxRuntime.jsxs(PaginationNavigationGroup.PaginationNavigationGroup, { children: [
            /* @__PURE__ */ jsxRuntime.jsx(PaginationArrowButton.PaginationArrowButton, { direction: "first" }),
            /* @__PURE__ */ jsxRuntime.jsx(PaginationArrowButton.PaginationArrowButton, { direction: "previous" }),
            /* @__PURE__ */ jsxRuntime.jsx(PaginationPageInput.PaginationPageInput, {}),
            /* @__PURE__ */ jsxRuntime.jsx(PaginationArrowButton.PaginationArrowButton, { direction: "next" }),
            /* @__PURE__ */ jsxRuntime.jsx(PaginationArrowButton.PaginationArrowButton, { direction: "last" })
          ] }),
          kind === "tabs" && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
            /* @__PURE__ */ jsxRuntime.jsxs(PaginationNavigationGroup.PaginationNavigationGroup, { children: [
              /* @__PURE__ */ jsxRuntime.jsx(PaginationArrowButton.PaginationArrowButton, { direction: "first" }),
              /* @__PURE__ */ jsxRuntime.jsx(PaginationArrowButton.PaginationArrowButton, { direction: "previous" })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsx(
              PaginationPageList.PaginationPageList,
              {
                items,
                renderedItemCount
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsxs(PaginationNavigationGroup.PaginationNavigationGroup, { children: [
              /* @__PURE__ */ jsxRuntime.jsx(PaginationArrowButton.PaginationArrowButton, { direction: "next" }),
              /* @__PURE__ */ jsxRuntime.jsx(PaginationArrowButton.PaginationArrowButton, { direction: "last" })
            ] })
          ] }),
          kind === "simple" && /* @__PURE__ */ jsxRuntime.jsxs(PaginationNavigationGroup.PaginationNavigationGroup, { children: [
            /* @__PURE__ */ jsxRuntime.jsx(PaginationArrowButton.PaginationArrowButton, { showText: true, direction: "previous" }),
            /* @__PURE__ */ jsxRuntime.jsx(PaginationArrowButton.PaginationArrowButton, { showText: true, direction: "next" })
          ] })
        ]
      }
    );
  }
);
Pagination.displayName = "Pagination";

exports.Pagination = Pagination;
