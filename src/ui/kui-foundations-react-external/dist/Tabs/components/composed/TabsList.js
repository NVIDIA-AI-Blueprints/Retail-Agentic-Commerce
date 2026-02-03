/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
// foundations-css import removed
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Slot } from '@radix-ui/react-slot';
import * as RadixTabs from '@radix-ui/react-tabs';
import { cva, cx } from 'class-variance-authority';
import { Button } from '../../../Button/index.js';
import { Icon } from '../../../lib/components/Icon.js';
import { Slottable } from '../../../lib/components/Slottable.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { TabsTestIds } from '../../constants.js';

const tabsList = cva("nv-tabs-list", {
  variants: {
    kind: {
      primary: "nv-tabs-list--kind-primary",
      secondary: "nv-tabs-list--kind-secondary",
      tertiary: "nv-tabs-list--kind-tertiary",
      unstyled: "nv-internal-tabs-list--kind-unstyled"
    }
  },
  defaultVariants: {
    kind: "primary"
  }
});
const TabsList = React.forwardRef(
  ({
    className,
    kind = "primary",
    children,
    asChild,
    hideOverflowButtons = false,
    visibleRange,
    ...props
  }, ref) => {
    const Component = asChild ? Slot : "div";
    const scrollContainerRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const renderChildrenWithRange = useCallback(
      (children2) => {
        if (!visibleRange || !React.Children.count(children2)) return children2;
        const childArray = React.Children.toArray(children2);
        const result = [];
        let lastIndex = -1;
        visibleRange.forEach((index) => {
          if (lastIndex !== -1 && index - lastIndex > 1) {
            result.push(
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: "nv-tabs-scroll-container-ellipses",
                  children: "..."
                },
                `ellipsis-${lastIndex}-${index}`
              )
            );
          }
          const child = childArray[index - 1];
          if (child) {
            result.push(child);
          }
          lastIndex = index;
        });
        return result;
      },
      [visibleRange]
    );
    const isVisibleInContainer = useCallback(
      (containerRect, elRect) => {
        const allowedMargin = 1;
        return elRect.top >= containerRect.top - allowedMargin && elRect.left >= containerRect.left - allowedMargin && elRect.bottom <= containerRect.bottom + allowedMargin && elRect.right <= containerRect.right + allowedMargin;
      },
      []
    );
    const getFirstElementVisibleFromLeft = useCallback(
      (container, elements) => {
        for (const element of elements) {
          if (isVisibleInContainer(container, element.getBoundingClientRect())) {
            return element;
          }
        }
        return null;
      },
      [isVisibleInContainer]
    );
    const checkScroll = useCallback(() => {
      const element = scrollContainerRef.current;
      if (!element) return;
      const containerRect = element.getBoundingClientRect();
      const items = Array.from(element.children);
      if (!items.length) return;
      const firstVisible = getFirstElementVisibleFromLeft(containerRect, items);
      setCanScrollLeft(firstVisible !== items[0]);
      const lastItemRect = items[items.length - 1].getBoundingClientRect();
      setCanScrollRight(
        Math.round(lastItemRect.right) > Math.round(containerRect.right)
      );
    }, [getFirstElementVisibleFromLeft]);
    useEffect(() => {
      const element = scrollContainerRef.current;
      if (!element) return;
      const observer = new ResizeObserver(checkScroll);
      observer.observe(element);
      element.addEventListener("scroll", checkScroll);
      checkScroll();
      return () => {
        observer.disconnect();
        element.removeEventListener("scroll", checkScroll);
      };
    }, [checkScroll]);
    const scroll = useCallback(
      (direction) => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const containerRect = container.getBoundingClientRect();
        const menuItems = Array.from(container.children);
        const searchSiblingKey = direction === "right" ? "nextElementSibling" : "previousElementSibling";
        const testElement = getFirstElementVisibleFromLeft(
          containerRect,
          menuItems
        );
        const candidate = testElement?.[searchSiblingKey];
        if (candidate) {
          const rect = candidate.getBoundingClientRect();
          const scrollAmount = rect.left - containerRect.left;
          const startPosition = container.scrollLeft;
          const startTime = performance.now();
          const duration = 300;
          let animationFrameId = null;
          const animate = (currentTime) => {
            if (!container) return;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easing = 1 - Math.pow(1 - progress, 3);
            container.scrollLeft = startPosition + scrollAmount * easing;
            if (progress < 1) {
              animationFrameId = requestAnimationFrame(animate);
            }
          };
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
          animationFrameId = requestAnimationFrame(animate);
        }
      },
      [getFirstElementVisibleFromLeft]
    );
    return /* @__PURE__ */ jsx(RadixTabs.List, { asChild: true, loop: false, children: /* @__PURE__ */ jsx(
      Component,
      {
        ...mergeProps(
          {
            className: tabsList({ kind, className }),
            ref,
            "data-testid": TabsTestIds.TabsList
          },
          props
        ),
        children: /* @__PURE__ */ jsx(Slottable, { asChild, child: children, children: (child) => /* @__PURE__ */ jsxs(Fragment, { children: [
          !hideOverflowButtons && canScrollLeft && /* @__PURE__ */ jsx(
            Button,
            {
              kind: "tertiary",
              color: "neutral",
              onClick: () => scroll("left"),
              "aria-label": "Scroll left",
              "aria-controls": "tabs-scroll-region",
              "aria-hidden": "true",
              tabIndex: -1,
              className: "nv-tabs-scroll-button",
              children: /* @__PURE__ */ jsx(Icon, { name: "chevron-left" })
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              id: "tabs-scroll-region",
              ref: scrollContainerRef,
              className: cx("nv-tabs-scroll-container", {
                "nv-tabs-scroll-container--fade-left": canScrollLeft,
                "nv-tabs-scroll-container--fade-right": canScrollRight,
                "nv-tabs-scroll-container--fade-both": canScrollLeft && canScrollRight
              }),
              children: renderChildrenWithRange(child)
            }
          ),
          !hideOverflowButtons && canScrollRight && /* @__PURE__ */ jsx(
            Button,
            {
              kind: "tertiary",
              color: "neutral",
              onClick: () => scroll("right"),
              "aria-label": "Scroll right",
              "aria-controls": "tabs-scroll-region",
              "aria-hidden": "true",
              tabIndex: -1,
              className: "nv-tabs-scroll-button",
              children: /* @__PURE__ */ jsx(Icon, { name: "chevron-right" })
            }
          )
        ] }) })
      }
    ) });
  }
);
TabsList.displayName = "TabsList";

export { TabsList };
