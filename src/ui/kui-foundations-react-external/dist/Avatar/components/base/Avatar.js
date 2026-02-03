/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsxs, jsx } from 'react/jsx-runtime';
// foundations-css import removed
import React from 'react';
import { useElementAttributes } from '../../../lib/hooks/use-element-attributes.js';
import { AvatarFallback } from '../composed/AvatarFallback.js';
import { AvatarImage } from '../composed/AvatarImage.js';
import { AvatarRoot } from '../composed/AvatarRoot.js';

const Avatar = React.forwardRef(
  ({ src, fallback, alt, attributes, size, kind, interactive, ...props }, ref) => {
    const [rootAttrs, imageAttrs, fallbackAttrs] = useElementAttributes(
      props,
      ["div", AvatarRoot],
      ["img", AvatarImage],
      ["div", AvatarFallback]
    );
    return /* @__PURE__ */ jsxs(
      AvatarRoot,
      {
        ref,
        size,
        interactive,
        kind,
        ...rootAttrs,
        children: [
          /* @__PURE__ */ jsx(
            AvatarImage,
            {
              src,
              alt,
              ...imageAttrs,
              ...attributes?.AvatarImage
            }
          ),
          /* @__PURE__ */ jsx(AvatarFallback, { ...fallbackAttrs, ...attributes?.AvatarFallback, children: fallback })
        ]
      }
    );
  }
);
Avatar.displayName = "Avatar";

export { Avatar };
