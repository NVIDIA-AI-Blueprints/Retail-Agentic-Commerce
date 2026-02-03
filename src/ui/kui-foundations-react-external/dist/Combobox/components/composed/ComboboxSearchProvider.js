/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
import React from 'react';
import { useComboboxContext, useStoreState } from '@ariakit/react';
import { DEFAULT_MATCH_FN, MenuSearchValueContext } from '../../../Menu/index.js';

function ComboboxSearchProvider({
  children,
  matchFn
}) {
  const comboboxStore = useComboboxContext();
  if (!comboboxStore) {
    throw new Error("ComboboxSearchProvider must be used within a Combobox");
  }
  const deferredValue = React.useDeferredValue(
    useStoreState(comboboxStore, "value")
  );
  const valueCtx = React.useMemo(
    () => ({ matchFn: matchFn ?? DEFAULT_MATCH_FN, value: deferredValue }),
    [matchFn, deferredValue]
  );
  return /* @__PURE__ */ jsx(MenuSearchValueContext.Provider, { value: valueCtx, children });
}

export { ComboboxSearchProvider };
