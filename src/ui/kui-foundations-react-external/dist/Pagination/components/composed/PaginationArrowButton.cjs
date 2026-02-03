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
var Button = require('../../../Button/index.cjs');
var Icon = require('../../../lib/components/Icon.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');

const paginationArrowButton = classVarianceAuthority.cva("nv-pagination-arrow-button");
const DIRECTION_MAP = {
  first: {
    icon: "chevron-double-left",
    "aria-label": "Go to first page",
    text: "First",
    textSide: "right"
  },
  previous: {
    icon: "chevron-left",
    "aria-label": "Go to previous page",
    text: "Previous",
    textSide: "right"
  },
  next: {
    icon: "chevron-right",
    "aria-label": "Go to next page",
    text: "Next",
    textSide: "left"
  },
  last: {
    icon: "chevron-double-right",
    "aria-label": "Go to last page",
    text: "Last",
    textSide: "left"
  }
};
const PaginationArrowButton = react.forwardRef(
  ({
    className,
    direction,
    showText,
    onClick,
    disabled: disabledOverride,
    ...props
  }, ref) => {
    const context$1 = context.usePaginationContext();
    const handleClick = react.useCallback(
      (event) => {
        switch (direction) {
          case "first":
            context$1.onPageChange(1);
            break;
          case "last":
            context$1.onPageChange(context$1.pageMeta.total);
            break;
          case "next":
            context$1.onPageChange(context$1.page + 1);
            break;
          case "previous":
            context$1.onPageChange(context$1.page - 1);
            break;
        }
        onClick?.(event);
      },
      [context$1, direction, onClick]
    );
    const disabled = react.useMemo(() => {
      if (disabledOverride) {
        return true;
      }
      switch (direction) {
        case "first":
          return context$1.page === 1;
        case "last":
          return context$1.page === context$1.pageMeta.total;
        case "next":
          return context$1.page === context$1.pageMeta.total;
        case "previous":
          return context$1.page === 1;
      }
    }, [disabledOverride, direction, context$1.page, context$1.pageMeta.total]);
    return /* @__PURE__ */ jsxRuntime.jsxs(
      Button.Button,
      {
        kind: "tertiary",
        onClick: handleClick,
        disabled,
        ...mergeProps.mergeProps(
          {
            className: paginationArrowButton({ className }),
            ref,
            "data-testid": constants.PaginationTestIds.PaginationArrowButton
          },
          props
        ),
        "aria-label": DIRECTION_MAP[direction]["aria-label"],
        children: [
          showText && DIRECTION_MAP[direction].textSide === "left" && DIRECTION_MAP[direction].text,
          /* @__PURE__ */ jsxRuntime.jsx(Icon.Icon, { name: DIRECTION_MAP[direction].icon }),
          showText && DIRECTION_MAP[direction].textSide === "right" && DIRECTION_MAP[direction].text
        ]
      }
    );
  }
);
PaginationArrowButton.displayName = "PaginationArrowButton";

exports.PaginationArrowButton = PaginationArrowButton;
