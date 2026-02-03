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
var RadixCheckbox = require('@radix-ui/react-checkbox');
var classVarianceAuthority = require('class-variance-authority');
var primitive = require('../../../lib/components/primitive.cjs');
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
var RadixCheckbox__namespace = /*#__PURE__*/_interopNamespace(RadixCheckbox);

const checkboxBox = classVarianceAuthority.cva("nv-checkbox-box", {
  variants: {
    error: {
      true: "nv-checkbox-box--error"
    }
  }
});
const CheckboxBox = React__default.default.forwardRef(
  ({
    className,
    error,
    defaultChecked,
    checked,
    onCheckedChange,
    disabled,
    name,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      RadixCheckbox__namespace.Root,
      {
        asChild: true,
        defaultChecked,
        checked,
        onCheckedChange,
        disabled,
        name,
        children: /* @__PURE__ */ jsxRuntime.jsx(
          primitive.Primitive.button,
          {
            ...mergeProps.mergeProps(
              {
                className: checkboxBox({ className, error }),
                "data-testid": constants.CheckboxTestIds.Box,
                ref
              },
              props
            )
          }
        )
      }
    );
  }
);
CheckboxBox.displayName = "CheckboxBox";

exports.CheckboxBox = CheckboxBox;
