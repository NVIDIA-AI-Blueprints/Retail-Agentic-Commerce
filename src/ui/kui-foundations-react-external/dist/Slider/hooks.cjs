/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var react = require('react');
var utils = require('./utils.cjs');

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? react.useEffect : () => {
};
function useThumbSize(element) {
  const [size, setSize] = react.useState(void 0);
  useIsomorphicLayoutEffect(() => {
    if (!element) {
      setSize(void 0);
      return;
    }
    setSize(utils.getElementDimensions(element));
    return utils.observeElementSize(element, setSize);
  }, [element]);
  return size;
}

exports.useThumbSize = useThumbSize;
