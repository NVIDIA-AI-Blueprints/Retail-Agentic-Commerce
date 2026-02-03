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
var useElementAttributes = require('../../../lib/hooks/use-element-attributes.cjs');
var TextInputElement = require('../composed/TextInputElement.cjs');
var TextInputRoot = require('../composed/TextInputRoot.cjs');

const TextInput = react.forwardRef(
  ({
    size,
    slotLeft,
    slotRight,
    status,
    defaultValue,
    value,
    onValueChange,
    type,
    readOnly,
    disabled,
    dismissible,
    attributes,
    ...props
  }, ref) => {
    const [rootAttrs, valueAttrs] = useElementAttributes.useElementAttributes(
      props,
      ["div", TextInputRoot.TextInputRoot],
      ["input", TextInputElement.TextInputElement]
    );
    return /* @__PURE__ */ jsxRuntime.jsx(
      TextInputRoot.TextInputRoot,
      {
        size,
        status,
        dismissible,
        slotLeft,
        slotRight,
        readOnly,
        disabled,
        value,
        defaultValue,
        onValueChange,
        ...rootAttrs,
        children: /* @__PURE__ */ jsxRuntime.jsx(
          TextInputElement.TextInputElement,
          {
            ref,
            type,
            ...valueAttrs,
            ...attributes?.TextInputValue
          }
        )
      }
    );
  }
);
TextInput.displayName = "TextInput";

exports.TextInput = TextInput;
