/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var react = require('react');
var fastEquals = require('fast-equals');
var attributes = require('../constants/attributes.cjs');

const elementKeys = /* @__PURE__ */ new Map();
const getElementKey = (element) => {
  let key = elementKeys.get(element);
  if (!key) {
    key = { element };
    elementKeys.set(element, key);
  }
  return key;
};
const attributeSetsCache = /* @__PURE__ */ new WeakMap();
const getElementAttributes = (element) => {
  const elementKey = getElementKey(element);
  const cached = attributeSetsCache.get(elementKey);
  if (cached) return cached;
  const attributes$1 = /* @__PURE__ */ new Set([
    ...attributes.ELEMENT_ATTRIBUTE_MAP[element] ?? [],
    ...attributes.COMMON_ATTRIBUTES
  ]);
  attributeSetsCache.set(elementKey, attributes$1);
  return attributes$1;
};
function useElementAttributes(props, ...pairs) {
  const elementAttributesRef = react.useRef(null);
  if (!elementAttributesRef.current) {
    elementAttributesRef.current = pairs.map(
      ([element]) => getElementAttributes(element)
    );
  }
  const prevPropsRef = react.useRef(null);
  const prevResultsRef = react.useRef(null);
  return react.useMemo(() => {
    if (prevResultsRef.current && prevPropsRef.current && fastEquals.shallowEqual(prevPropsRef.current, props)) {
      if (props.style) {
        prevResultsRef.current[0].style = props.style;
      }
      return prevResultsRef.current;
    }
    const results = pairs.map(() => ({}));
    const assignedProps = /* @__PURE__ */ new Set();
    const elementAttributes = elementAttributesRef.current;
    if (!elementAttributes) {
      return results;
    }
    for (const [key, value] of Object.entries(props)) {
      let assigned = false;
      for (let i = 0; i < pairs.length; i++) {
        if (elementAttributes[i].has(key)) {
          results[i][key] = value;
          assignedProps.add(key);
          assigned = true;
          break;
        }
      }
      if (!assigned) {
        results[0][key] = value;
      }
    }
    prevPropsRef.current = props;
    prevResultsRef.current = results;
    return results;
  }, [pairs, props]);
}

exports.useElementAttributes = useElementAttributes;
