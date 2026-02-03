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
var classVarianceAuthority = require('class-variance-authority');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var mergeRefs = require('../../../lib/utils/merge-refs.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');

const textAreaElement = classVarianceAuthority.cva("nv-text-area-element", {
  variants: {
    resizeable: {
      manual: "nv-text-area-element--resizeable-manual",
      auto: "nv-text-area-element--resizeable-auto"
    }
  }
});
const TextAreaElement = react.forwardRef(({ className, onChange, resizeable, ...props }, ref) => {
  const innerRef = react.useRef(null);
  const context$1 = context.useTextAreaContext();
  const adjustHeight = react.useCallback(() => {
    if (resizeable === "auto" && innerRef.current) {
      innerRef.current.style.height = "auto";
      innerRef.current.style.height = innerRef.current.scrollHeight + "px";
    }
  }, [resizeable]);
  react.useEffect(() => {
    adjustHeight();
  }, [context$1.value, adjustHeight]);
  react.useEffect(() => {
    if (!resizeable) return;
    window.addEventListener("resize", adjustHeight);
    return () => {
      window.removeEventListener("resize", adjustHeight);
    };
  }, [resizeable, adjustHeight]);
  const handleChange = react.useCallback(
    (e) => {
      onChange?.(e);
      if (!e.defaultPrevented) {
        context$1.onValueChange?.(e.target.value);
      }
    },
    [onChange, context$1]
  );
  return /* @__PURE__ */ jsxRuntime.jsx(
    "textarea",
    {
      ...mergeProps.mergeProps(
        {
          className: textAreaElement({
            className,
            resizeable
          }),
          ref: mergeRefs.mergeRefs(ref, innerRef),
          value: context$1.value,
          disabled: context$1.disabled || context$1.readOnly,
          readOnly: context$1.readOnly,
          "data-testid": constants.TextAreaTestIds.TextAreaElement,
          rows: 3
        },
        props
      ),
      onChange: handleChange
    }
  );
});
TextAreaElement.displayName = "TextAreaElement";

exports.TextAreaElement = TextAreaElement;
