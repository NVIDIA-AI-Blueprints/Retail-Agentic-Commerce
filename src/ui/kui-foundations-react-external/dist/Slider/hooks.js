/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { useState, useEffect } from 'react';
import { getElementDimensions, observeElementSize } from './utils.js';

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useEffect : () => {
};
function useThumbSize(element) {
  const [size, setSize] = useState(void 0);
  useIsomorphicLayoutEffect(() => {
    if (!element) {
      setSize(void 0);
      return;
    }
    setSize(getElementDimensions(element));
    return observeElementSize(element, setSize);
  }, [element]);
  return size;
}

export { useThumbSize };
