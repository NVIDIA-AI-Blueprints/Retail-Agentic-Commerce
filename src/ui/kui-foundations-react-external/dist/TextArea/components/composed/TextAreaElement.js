/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef, useRef, useCallback, useEffect } from 'react';
import { cva } from 'class-variance-authority';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { mergeRefs } from '../../../lib/utils/merge-refs.js';
import { TextAreaTestIds } from '../../constants.js';
import { useTextAreaContext } from '../../context.js';

const textAreaElement = cva("nv-text-area-element", {
  variants: {
    resizeable: {
      manual: "nv-text-area-element--resizeable-manual",
      auto: "nv-text-area-element--resizeable-auto"
    }
  }
});
const TextAreaElement = forwardRef(({ className, onChange, resizeable, ...props }, ref) => {
  const innerRef = useRef(null);
  const context = useTextAreaContext();
  const adjustHeight = useCallback(() => {
    if (resizeable === "auto" && innerRef.current) {
      innerRef.current.style.height = "auto";
      innerRef.current.style.height = innerRef.current.scrollHeight + "px";
    }
  }, [resizeable]);
  useEffect(() => {
    adjustHeight();
  }, [context.value, adjustHeight]);
  useEffect(() => {
    if (!resizeable) return;
    window.addEventListener("resize", adjustHeight);
    return () => {
      window.removeEventListener("resize", adjustHeight);
    };
  }, [resizeable, adjustHeight]);
  const handleChange = useCallback(
    (e) => {
      onChange?.(e);
      if (!e.defaultPrevented) {
        context.onValueChange?.(e.target.value);
      }
    },
    [onChange, context]
  );
  return /* @__PURE__ */ jsx(
    "textarea",
    {
      ...mergeProps(
        {
          className: textAreaElement({
            className,
            resizeable
          }),
          ref: mergeRefs(ref, innerRef),
          value: context.value,
          disabled: context.disabled || context.readOnly,
          readOnly: context.readOnly,
          "data-testid": TextAreaTestIds.TextAreaElement,
          rows: 3
        },
        props
      ),
      onChange: handleChange
    }
  );
});
TextAreaElement.displayName = "TextAreaElement";

export { TextAreaElement };
