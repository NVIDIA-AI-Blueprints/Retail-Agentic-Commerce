/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

function mergeRefs(...refArguments) {
  const validRefs = refArguments.filter(Boolean);
  if (validRefs.length <= 1) {
    return validRefs[0] || null;
  }
  return function mergedRefs(ref) {
    validRefs.forEach((inputRef) => {
      if (typeof inputRef === "function") {
        inputRef(ref);
      } else {
        if (inputRef) {
          inputRef.current = ref;
        }
      }
    });
  };
}

export { mergeRefs };
