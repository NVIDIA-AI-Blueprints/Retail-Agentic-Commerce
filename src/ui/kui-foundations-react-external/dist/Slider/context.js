/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { createContext, useContext } from 'react';

const SliderContext = createContext({
  min: 0,
  max: 100,
  step: 1,
  orientation: void 0,
  thumb: null,
  setThumb: () => {
  }
});
function useSliderContext() {
  const context = useContext(SliderContext);
  if (!context) {
    throw new Error("SliderContext must be used within a SliderRoot");
  }
  return context;
}

export { SliderContext, useSliderContext };
