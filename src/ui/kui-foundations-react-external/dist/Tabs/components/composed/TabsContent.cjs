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
var RadixTabs = require('@radix-ui/react-tabs');
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
var RadixTabs__namespace = /*#__PURE__*/_interopNamespace(RadixTabs);

const tabsContent = classVarianceAuthority.cva("nv-tabs-content");
const TabsContent = React__default.default.forwardRef(
  ({ className, value, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(RadixTabs__namespace.Content, { asChild: true, value, children: /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.div,
      {
        ...mergeProps.mergeProps(
          {
            className: tabsContent({ className }),
            ref,
            "data-testid": constants.TabsTestIds.TabsContent
          },
          props
        )
      }
    ) });
  }
);
TabsContent.displayName = "TabsContent";

exports.TabsContent = TabsContent;
