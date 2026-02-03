/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { Anchor } from '../../../Anchor/index.js';
import { HorizontalNavLink } from '../composed/HorizontalNavLink.js';
import { HorizontalNavList } from '../composed/HorizontalNavList.js';
import { HorizontalNavRoot } from '../composed/HorizontalNavRoot.js';

const HorizontalNav = forwardRef(
  ({
    items,
    renderLink = (item) => /* @__PURE__ */ jsx(Anchor, { kind: "standalone", ...item }),
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsx(HorizontalNavRoot, { ref, ...props, children: items.length > 0 && /* @__PURE__ */ jsx(HorizontalNavList, { ...props.attributes?.HorizontalNavList, children: items.map((item) => /* @__PURE__ */ jsx(
      HorizontalNavLink,
      {
        value: item.value,
        disabled: item.disabled,
        ...props.attributes?.HorizontalNavLink,
        children: renderLink(item)
      },
      item.value
    )) }) });
  }
);
HorizontalNav.displayName = "HorizontalNav";

export { HorizontalNav };
