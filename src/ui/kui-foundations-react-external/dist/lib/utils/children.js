/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import React from 'react';

const EMPTY_VALUES = /* @__PURE__ */ new Set([void 0, null, true, false]);
function nodeToString(node) {
  if (EMPTY_VALUES.has(node)) return "";
  if (node !== null && (typeof node === "object" || typeof node === "function") && !React.isValidElement(node) && Object.keys(node).length === 0)
    return "";
  return String(node);
}
function childrenToText(children) {
  if (typeof children === "string") return children;
  if (typeof children === "number") return children.toString();
  if (!children) return "";
  if (Array.isArray(children)) {
    return children.map((child) => childrenToText(child)).join("");
  }
  if (React.isValidElement(children)) {
    const element = children;
    return element.props.children ? childrenToText(element.props.children) : "";
  }
  return nodeToString(children);
}

export { childrenToText };
