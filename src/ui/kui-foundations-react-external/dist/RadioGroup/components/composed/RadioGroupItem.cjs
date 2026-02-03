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
var RadioGroupPrimitives = require('@radix-ui/react-radio-group');
var reactSlot = require('@radix-ui/react-slot');
var classVarianceAuthority = require('class-variance-authority');
var Slottable = require('../../../lib/components/Slottable.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

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

var RadioGroupPrimitives__namespace = /*#__PURE__*/_interopNamespace(RadioGroupPrimitives);

const radioGroupItem = classVarianceAuthority.cva("nv-radio-group-item", {
  variants: {
    danger: {
      true: "nv-radio-group-item--danger"
    },
    labelSide: {
      left: "nv-radio-group-item--left-side-label",
      right: ""
    }
  }
});
const RadioGroupItem = react.forwardRef(
  ({
    asChild,
    children,
    className,
    danger,
    disabled,
    labelSide,
    required,
    showIndicator = true,
    value,
    ...props
  }, ref) => {
    const Component = asChild ? reactSlot.Slot : "button";
    return /* @__PURE__ */ jsxRuntime.jsx(
      RadioGroupPrimitives__namespace.RadioGroupItem,
      {
        asChild: true,
        disabled,
        required,
        value,
        children: /* @__PURE__ */ jsxRuntime.jsx(
          Component,
          {
            ...mergeProps.mergeProps(
              {
                className: radioGroupItem({ className, danger, labelSide }),
                ref,
                "data-testid": constants.RadioGroupTestIds.RadioGroupItem
              },
              props
            ),
            children: /* @__PURE__ */ jsxRuntime.jsx(Slottable.Slottable, { asChild, child: children, children: (child) => /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
              showIndicator && /* @__PURE__ */ jsxRuntime.jsx(
                "div",
                {
                  className: "nv-radio-group-input",
                  "data-testid": constants.RadioGroupTestIds.RadioGroupInput,
                  children: /* @__PURE__ */ jsxRuntime.jsx(
                    RadioGroupPrimitives__namespace.RadioGroupIndicator,
                    {
                      forceMount: true,
                      className: "nv-radio-group-indicator",
                      "data-testid": constants.RadioGroupTestIds.RadioGroupIndicator
                    }
                  )
                }
              ),
              child
            ] }) })
          }
        )
      }
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

exports.RadioGroupItem = RadioGroupItem;
