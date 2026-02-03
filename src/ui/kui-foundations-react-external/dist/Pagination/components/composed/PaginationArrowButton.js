/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsxs, jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef, useCallback, useMemo } from 'react';
import { cva } from 'class-variance-authority';
import { Button } from '../../../Button/index.js';
import { Icon } from '../../../lib/components/Icon.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { PaginationTestIds } from '../../constants.js';
import { usePaginationContext } from '../../context.js';

const paginationArrowButton = cva("nv-pagination-arrow-button");
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
const PaginationArrowButton = forwardRef(
  ({
    className,
    direction,
    showText,
    onClick,
    disabled: disabledOverride,
    ...props
  }, ref) => {
    const context = usePaginationContext();
    const handleClick = useCallback(
      (event) => {
        switch (direction) {
          case "first":
            context.onPageChange(1);
            break;
          case "last":
            context.onPageChange(context.pageMeta.total);
            break;
          case "next":
            context.onPageChange(context.page + 1);
            break;
          case "previous":
            context.onPageChange(context.page - 1);
            break;
        }
        onClick?.(event);
      },
      [context, direction, onClick]
    );
    const disabled = useMemo(() => {
      if (disabledOverride) {
        return true;
      }
      switch (direction) {
        case "first":
          return context.page === 1;
        case "last":
          return context.page === context.pageMeta.total;
        case "next":
          return context.page === context.pageMeta.total;
        case "previous":
          return context.page === 1;
      }
    }, [disabledOverride, direction, context.page, context.pageMeta.total]);
    return /* @__PURE__ */ jsxs(
      Button,
      {
        kind: "tertiary",
        onClick: handleClick,
        disabled,
        ...mergeProps(
          {
            className: paginationArrowButton({ className }),
            ref,
            "data-testid": PaginationTestIds.PaginationArrowButton
          },
          props
        ),
        "aria-label": DIRECTION_MAP[direction]["aria-label"],
        children: [
          showText && DIRECTION_MAP[direction].textSide === "left" && DIRECTION_MAP[direction].text,
          /* @__PURE__ */ jsx(Icon, { name: DIRECTION_MAP[direction].icon }),
          showText && DIRECTION_MAP[direction].textSide === "right" && DIRECTION_MAP[direction].text
        ]
      }
    );
  }
);
PaginationArrowButton.displayName = "PaginationArrowButton";

export { PaginationArrowButton };
