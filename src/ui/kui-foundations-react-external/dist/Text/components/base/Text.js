/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { TextTestIds } from '../../constants.js';

const text = cva("nv-text", {
  variants: {
    fontFamily: {
      sans: "nv-text--font-sans",
      mono: "nv-text--font-mono"
    },
    fontWeight: {
      light: "nv-text--weight-light",
      regular: "nv-text--weight-regular",
      semibold: "nv-text--weight-semibold",
      bold: "nv-text--weight-bold"
    },
    fontStyle: {
      normal: "nv-text--style-normal",
      italic: "nv-text--style-italic"
    },
    fontSize: {
      "10": "nv-text--size-10",
      "12": "nv-text--size-12",
      "14": "nv-text--size-14",
      "16": "nv-text--size-16",
      "18": "nv-text--size-18",
      "20": "nv-text--size-20",
      "22": "nv-text--size-22",
      "24": "nv-text--size-24",
      "28": "nv-text--size-28",
      "32": "nv-text--size-32",
      "36": "nv-text--size-36",
      "40": "nv-text--size-40",
      "44": "nv-text--size-44",
      "48": "nv-text--size-48",
      "50": "nv-text--size-50",
      "56": "nv-text--size-56",
      "60": "nv-text--size-60",
      "64": "nv-text--size-64",
      "72": "nv-text--size-72",
      "80": "nv-text--size-80"
    },
    underline: {
      true: "nv-text--underline"
    },
    lineHeight: {
      "100": "nv-text--line-height-100",
      "125": "nv-text--line-height-125",
      "150": "nv-text--line-height-150",
      "175": "nv-text--line-height-175"
    },
    kind: {
      "body/bold/2xl": "nv-text--body-bold-2xl",
      "body/bold/3xl": "nv-text--body-bold-3xl",
      "body/bold/lg": "nv-text--body-bold-lg",
      "body/bold/md": "nv-text--body-bold-md",
      "body/bold/xl": "nv-text--body-bold-xl",
      "body/bold/sm": "nv-text--body-bold-sm",
      "body/bold/xs": "nv-text--body-bold-xs",
      "body/regular/lg": "nv-text--body-regular-lg",
      "body/regular/md": "nv-text--body-regular-md",
      "body/regular/sm": "nv-text--body-regular-sm",
      "body/regular/xl": "nv-text--body-regular-xl",
      "body/regular/2xl": "nv-text--body-regular-2xl",
      "body/regular/3xl": "nv-text--body-regular-3xl",
      "body/regular/xs": "nv-text--body-regular-xs",
      "body/semibold/2xl": "nv-text--body-semibold-2xl",
      "body/semibold/3xl": "nv-text--body-semibold-3xl",
      "body/semibold/lg": "nv-text--body-semibold-lg",
      "body/semibold/md": "nv-text--body-semibold-md",
      "body/semibold/sm": "nv-text--body-semibold-sm",
      "body/semibold/xl": "nv-text--body-semibold-xl",
      "body/semibold/xs": "nv-text--body-semibold-xs",
      "display/2xl": "nv-text--display-2xl",
      "display/xl": "nv-text--display-xl",
      "display/lg": "nv-text--display-lg",
      "display/md": "nv-text--display-md",
      "display/sm": "nv-text--display-sm",
      "display/xs": "nv-text--display-xs",
      "label/bold/2xl": "nv-text--label-bold-2xl",
      "label/bold/3xl": "nv-text--label-bold-3xl",
      "label/bold/lg": "nv-text--label-bold-lg",
      "label/bold/md": "nv-text--label-bold-md",
      "label/bold/sm": "nv-text--label-bold-sm",
      "label/bold/xl": "nv-text--label-bold-xl",
      "label/bold/xs": "nv-text--label-bold-xs",
      "label/light/lg": "nv-text--label-light-lg",
      "label/light/xl": "nv-text--label-light-xl",
      "label/light/2xl": "nv-text--label-light-2xl",
      "label/light/3xl": "nv-text--label-light-3xl",
      "label/light/md": "nv-text--label-light-md",
      "label/light/sm": "nv-text--label-light-sm",
      "label/light/xs": "nv-text--label-light-xs",
      "label/regular/lg": "nv-text--label-regular-lg",
      "label/regular/md": "nv-text--label-regular-md",
      "label/regular/sm": "nv-text--label-regular-sm",
      "label/regular/xs": "nv-text--label-regular-xs",
      "label/regular/xl": "nv-text--label-regular-xl",
      "label/regular/2xl": "nv-text--label-regular-2xl",
      "label/regular/3xl": "nv-text--label-regular-3xl",
      "label/semibold/lg": "nv-text--label-semibold-lg",
      "label/semibold/md": "nv-text--label-semibold-md",
      "label/semibold/sm": "nv-text--label-semibold-sm",
      "label/semibold/xl": "nv-text--label-semibold-xl",
      "label/semibold/2xl": "nv-text--label-semibold-2xl",
      "label/semibold/3xl": "nv-text--label-semibold-3xl",
      "label/semibold/xs": "nv-text--label-semibold-xs",
      "mono/md": "nv-text--mono-md",
      "mono/sm": "nv-text--mono-sm",
      "mono/lg": "nv-text--mono-lg",
      "mono/xl": "nv-text--mono-xl",
      "mono/2xl": "nv-text--mono-2xl",
      "title/2xl": "nv-text--title-2xl",
      "title/xl": "nv-text--title-xl",
      "title/lg": "nv-text--title-lg",
      "title/md": "nv-text--title-md",
      "title/sm": "nv-text--title-sm",
      "title/xs": "nv-text--title-xs"
    }
  }
});
const Text = forwardRef(
  ({
    className,
    kind = "label/regular/md",
    fontFamily,
    fontWeight,
    fontStyle,
    fontSize,
    lineHeight,
    underline,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsx(
      Primitive.span,
      {
        ...mergeProps(
          {
            className: text({
              className,
              kind,
              fontFamily,
              fontWeight,
              fontStyle,
              fontSize,
              lineHeight,
              underline
            }),
            ref,
            "data-testid": TextTestIds.Text
          },
          props
        )
      }
    );
  }
);
Text.displayName = "Text";

export { Text };
