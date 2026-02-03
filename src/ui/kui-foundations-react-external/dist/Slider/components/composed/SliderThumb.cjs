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

const sliderThumb = classVarianceAuthority.cva("nv-slider-thumb");
const SliderThumb = react.forwardRef(
  ({ className, ...props }, ref) => {
    const context$1 = context.useSliderContext();
    const internalRef = react.useRef(null);
    react.useImperativeHandle(ref, () => internalRef.current, []);
    react.useEffect(() => {
      if (internalRef.current && context$1.setThumb) {
        context$1.setThumb(internalRef.current);
      }
    }, [context$1]);
    return /* @__PURE__ */ jsxRuntime.jsx(RadixSlider__namespace.Thumb, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.span,
      {
        ...mergeProps.mergeProps(
          {
            className: sliderThumb({ className }),
            ref: internalRef,
            "data-testid": constants.SliderTestIds.SliderThumb
          },
          props
        )
      }
    ) });
  }
);
SliderThumb.displayName = "SliderThumb";

exports.SliderThumb = SliderThumb;
