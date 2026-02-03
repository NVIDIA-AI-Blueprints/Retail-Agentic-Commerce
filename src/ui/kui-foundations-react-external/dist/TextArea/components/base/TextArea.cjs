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
var TextAreaElement = require('../composed/TextAreaElement.cjs');
var TextAreaRoot = require('../composed/TextAreaRoot.cjs');

const TextArea = react.forwardRef(
  ({
    resizeable,
    size,
    status,
    attributes,
    value,
    onValueChange,
    defaultValue,
    readOnly,
    disabled,
    slotLeft,
    slotRight,
    ...props
  }, ref) => {
    const [rootAttrs, elementAttrs] = useElementAttributes.useElementAttributes(
      props,
      ["div", TextAreaRoot.TextAreaRoot],
      ["textarea", TextAreaElement.TextAreaElement]
    );
    return /* @__PURE__ */ jsxRuntime.jsx(
      TextAreaRoot.TextAreaRoot,
      {
        size,
        status,
        value,
        onValueChange,
        defaultValue,
        readOnly,
        disabled,
        slotLeft,
        slotRight,
        ...rootAttrs,
        children: /* @__PURE__ */ jsxRuntime.jsx(
          TextAreaElement.TextAreaElement,
          {
            ref,
            resizeable,
            ...elementAttrs,
            ...attributes?.TextAreaElement
          }
        )
      }
    );
  }
);
TextArea.displayName = "TextArea";

exports.TextArea = TextArea;
