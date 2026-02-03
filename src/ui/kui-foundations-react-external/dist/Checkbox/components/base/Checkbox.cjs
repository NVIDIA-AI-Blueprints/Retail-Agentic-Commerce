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
var Label = require('../../../Label/index.cjs');
var useElementAttributes = require('../../../lib/hooks/use-element-attributes.cjs');
var CheckboxBox = require('../composed/CheckboxBox.cjs');
var CheckboxIndicator = require('../composed/CheckboxIndicator.cjs');
var CheckboxRoot = require('../composed/CheckboxRoot.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const Checkbox = React__default.default.forwardRef(
  ({
    labelSide,
    slotLabel,
    disabled,
    error,
    attributes,
    className,
    checked,
    defaultChecked,
    onCheckedChange,
    ...props
  }, ref) => {
    const boxId = React__default.default.useId();
    const labelId = React__default.default.useId();
    const [rootAttrs, boxAttrs, indicatorAttrs, labelAttrs] = useElementAttributes.useElementAttributes(
      props,
      ["div", CheckboxRoot.CheckboxRoot],
      ["button", CheckboxBox.CheckboxBox],
      ["div", CheckboxIndicator.CheckboxIndicator],
      ["label", Label.Label]
    );
    return /* @__PURE__ */ jsxRuntime.jsxs(CheckboxRoot.CheckboxRoot, { className, labelSide, ...rootAttrs, children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        CheckboxBox.CheckboxBox,
        {
          checked,
          onCheckedChange,
          defaultChecked,
          disabled,
          error,
          ref,
          id: boxId,
          "aria-labelledby": labelId,
          ...boxAttrs,
          ...attributes?.CheckboxBox,
          children: /* @__PURE__ */ jsxRuntime.jsx(
            CheckboxIndicator.CheckboxIndicator,
            {
              checked,
              error,
              ...indicatorAttrs
            }
          )
        }
      ),
      slotLabel && /* @__PURE__ */ jsxRuntime.jsx(
        Label.Label,
        {
          disabled,
          id: labelId,
          htmlFor: boxId,
          ...labelAttrs,
          ...attributes?.Label,
          children: slotLabel
        }
      )
    ] });
  }
);
Checkbox.displayName = "Checkbox";

exports.Checkbox = Checkbox;
