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
var RadixSlider = require('@radix-ui/react-slider');
var classVarianceAuthority = require('class-variance-authority');
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');

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

var RadixSlider__namespace = /*#__PURE__*/_interopNamespace(RadixSlider);

const sliderRoot = classVarianceAuthority.cva("nv-slider-root", {
  variants: {
    orientation: {
      horizontal: "",
      vertical: "nv-slider-root--orientation-vertical"
    }
  },
  defaultVariants: {
    orientation: "horizontal"
  }
});
const SliderRoot = react.forwardRef(
  ({
    className,
    orientation,
    disabled,
    value,
    kind = "single",
    min = 0,
    max = 100,
    defaultValue = kind === "range" ? [min, max] : min,
    onValueChange,
    onValueCommit,
    step = 1,
    minStepsBetweenThumbs,
    name,
    form,
    ...props
  }, ref) => {
    const [thumb, setThumb] = react.useState(null);
    const convertedProps = react.useMemo(
      () => ({
        value: kind === "range" ? value : value !== void 0 ? [value] : void 0,
        defaultValue: kind === "range" ? defaultValue : defaultValue !== void 0 ? [defaultValue] : void 0,
        onValueChange: kind === "range" ? onValueChange : onValueChange ? (nextValue) => onValueChange(nextValue[0]) : void 0,
        onValueCommit: kind === "range" ? onValueCommit : onValueCommit ? (nextValue) => onValueCommit(nextValue[0]) : void 0
      }),
      [defaultValue, kind, onValueChange, onValueCommit, value]
    );
    return /* @__PURE__ */ jsxRuntime.jsx(
      context.SliderContext.Provider,
      {
        value: { min, max, step, orientation, thumb, setThumb },
        children: /* @__PURE__ */ jsxRuntime.jsx(
          RadixSlider__namespace.Root,
          {
            disabled,
            min,
            max,
            step,
            minStepsBetweenThumbs,
            name,
            form,
            orientation,
            asChild: true,
            ...convertedProps,
            children: /* @__PURE__ */ jsxRuntime.jsx(
              primitive.Primitive.span,
              {
                ...mergeProps.mergeProps(
                  {
                    className: sliderRoot({ className, orientation }),
                    ref,
                    "data-testid": constants.SliderTestIds.SliderRoot
                  },
                  props
                )
              }
            )
          }
        )
      }
    );
  }
);
SliderRoot.displayName = "SliderRoot";

exports.SliderRoot = SliderRoot;
