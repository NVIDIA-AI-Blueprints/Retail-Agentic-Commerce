/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
// foundations-css import removed
var React = require('react');
var reactSlot = require('@radix-ui/react-slot');
var RadixTabs = require('@radix-ui/react-tabs');
var classVarianceAuthority = require('class-variance-authority');
var Button = require('../../../Button/index.cjs');
var Icon = require('../../../lib/components/Icon.cjs');
var Slottable = require('../../../lib/components/Slottable.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var React__default = /*#__PURE__*/_interopDefault(React);
var RadixTabs__namespace = /*#__PURE__*/_interopNamespace(RadixTabs);

const tabsList = classVarianceAuthority.cva("nv-tabs-list", {
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
const TabsList = React__default.default.forwardRef(
  ({
    className,
    kind = "primary",
    children,
    asChild,
    hideOverflowButtons = false,
    visibleRange,
    ...props
  }, ref) => {
    const Component = asChild ? reactSlot.Slot : "div";
    const scrollContainerRef = React.useRef(null);
    const [canScrollLeft, setCanScrollLeft] = React.useState(false);
    const [canScrollRight, setCanScrollRight] = React.useState(false);
    const renderChildrenWithRange = React.useCallback(
      (children2) => {
        if (!visibleRange || !React__default.default.Children.count(children2)) return children2;
        const childArray = React__default.default.Children.toArray(children2);
        const result = [];
        let lastIndex = -1;
        visibleRange.forEach((index) => {
          if (lastIndex !== -1 && index - lastIndex > 1) {
            result.push(
              /* @__PURE__ */ jsxRuntime.jsx(
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
    const isVisibleInContainer = React.useCallback(
      (containerRect, elRect) => {
        const allowedMargin = 1;
        return elRect.top >= containerRect.top - allowedMargin && elRect.left >= containerRect.left - allowedMargin && elRect.bottom <= containerRect.bottom + allowedMargin && elRect.right <= containerRect.right + allowedMargin;
      },
      []
    );
    const getFirstElementVisibleFromLeft = React.useCallback(
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
    const checkScroll = React.useCallback(() => {
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
    React.useEffect(() => {
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
    const scroll = React.useCallback(
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
    return /* @__PURE__ */ jsxRuntime.jsx(RadixTabs__namespace.List, { asChild: true, loop: false, children: /* @__PURE__ */ jsxRuntime.jsx(
      Component,
      {
        ...mergeProps.mergeProps(
          {
            className: tabsList({ kind, className }),
            ref,
            "data-testid": constants.TabsTestIds.TabsList
          },
          props
        ),
        children: /* @__PURE__ */ jsxRuntime.jsx(Slottable.Slottable, { asChild, child: children, children: (child) => /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
          !hideOverflowButtons && canScrollLeft && /* @__PURE__ */ jsxRuntime.jsx(
            Button.Button,
            {
              kind: "tertiary",
              color: "neutral",
              onClick: () => scroll("left"),
              "aria-label": "Scroll left",
              "aria-controls": "tabs-scroll-region",
              "aria-hidden": "true",
              tabIndex: -1,
              className: "nv-tabs-scroll-button",
              children: /* @__PURE__ */ jsxRuntime.jsx(Icon.Icon, { name: "chevron-left" })
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            "div",
            {
              id: "tabs-scroll-region",
              ref: scrollContainerRef,
              className: classVarianceAuthority.cx("nv-tabs-scroll-container", {
                "nv-tabs-scroll-container--fade-left": canScrollLeft,
                "nv-tabs-scroll-container--fade-right": canScrollRight,
                "nv-tabs-scroll-container--fade-both": canScrollLeft && canScrollRight
              }),
              children: renderChildrenWithRange(child)
            }
          ),
          !hideOverflowButtons && canScrollRight && /* @__PURE__ */ jsxRuntime.jsx(
            Button.Button,
            {
              kind: "tertiary",
              color: "neutral",
              onClick: () => scroll("right"),
              "aria-label": "Scroll right",
              "aria-controls": "tabs-scroll-region",
              "aria-hidden": "true",
              tabIndex: -1,
              className: "nv-tabs-scroll-button",
              children: /* @__PURE__ */ jsxRuntime.jsx(Icon.Icon, { name: "chevron-right" })
            }
          )
        ] }) })
      }
    ) });
  }
);
TabsList.displayName = "TabsList";

exports.TabsList = TabsList;
