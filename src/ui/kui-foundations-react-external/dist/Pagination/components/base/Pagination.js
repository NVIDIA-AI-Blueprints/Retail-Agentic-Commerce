/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { Divider } from '../../../Divider/index.js';
import { PaginationArrowButton } from '../composed/PaginationArrowButton.js';
import { PaginationControlsGroup } from '../composed/PaginationControlsGroup.js';
import { PaginationItemRangeText } from '../composed/PaginationItemRangeText.js';
import { PaginationNavigationGroup } from '../composed/PaginationNavigationGroup.js';
import { PaginationPageInput } from '../composed/PaginationPageInput.js';
import { PaginationPageList } from '../composed/PaginationPageList.js';
import { PaginationPageSizeSelect } from '../composed/PaginationPageSizeSelect.js';
import { PaginationRoot } from '../composed/PaginationRoot.js';

const pagination = cva("nv-pagination", {
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
const Pagination = forwardRef(
  ({
    className,
    kind = "input",
    items,
    displayControls = false,
    rangeTextFormatFn,
    renderedItemCount,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsxs(
      PaginationRoot,
      {
        className: pagination({ kind, className }),
        ref,
        ...props,
        children: [
          displayControls && /* @__PURE__ */ jsxs(PaginationControlsGroup, { children: [
            "Items per page",
            /* @__PURE__ */ jsx(PaginationPageSizeSelect, {}),
            /* @__PURE__ */ jsx(Divider, { orientation: "vertical", width: "small" }),
            /* @__PURE__ */ jsx(PaginationItemRangeText, { rangeTextFormatFn })
          ] }),
          kind === "input" && /* @__PURE__ */ jsxs(PaginationNavigationGroup, { children: [
            /* @__PURE__ */ jsx(PaginationArrowButton, { direction: "first" }),
            /* @__PURE__ */ jsx(PaginationArrowButton, { direction: "previous" }),
            /* @__PURE__ */ jsx(PaginationPageInput, {}),
            /* @__PURE__ */ jsx(PaginationArrowButton, { direction: "next" }),
            /* @__PURE__ */ jsx(PaginationArrowButton, { direction: "last" })
          ] }),
          kind === "tabs" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs(PaginationNavigationGroup, { children: [
              /* @__PURE__ */ jsx(PaginationArrowButton, { direction: "first" }),
              /* @__PURE__ */ jsx(PaginationArrowButton, { direction: "previous" })
            ] }),
            /* @__PURE__ */ jsx(
              PaginationPageList,
              {
                items,
                renderedItemCount
              }
            ),
            /* @__PURE__ */ jsxs(PaginationNavigationGroup, { children: [
              /* @__PURE__ */ jsx(PaginationArrowButton, { direction: "next" }),
              /* @__PURE__ */ jsx(PaginationArrowButton, { direction: "last" })
            ] })
          ] }),
          kind === "simple" && /* @__PURE__ */ jsxs(PaginationNavigationGroup, { children: [
            /* @__PURE__ */ jsx(PaginationArrowButton, { showText: true, direction: "previous" }),
            /* @__PURE__ */ jsx(PaginationArrowButton, { showText: true, direction: "next" })
          ] })
        ]
      }
    );
  }
);
Pagination.displayName = "Pagination";

export { Pagination };
