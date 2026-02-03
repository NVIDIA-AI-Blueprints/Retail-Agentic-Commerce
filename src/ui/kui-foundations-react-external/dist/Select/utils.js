/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

function isSection(entry) {
  return typeof entry === "object" && entry !== null && "items" in entry && Array.isArray(entry?.items);
}
function isValueEqual(value, item) {
  return typeof item === "string" ? item === value : item.value === value;
}
function findItemByValue(value, items) {
  for (const item of items) {
    if (isSection(item)) {
      for (const sectionItem of item.items) {
        if (isValueEqual(value, sectionItem)) {
          return sectionItem;
        }
      }
    } else if (isValueEqual(value, item)) {
      return item;
    }
  }
  return void 0;
}
function getSelectedItemValue(value, items) {
  if (!value || Array.isArray(value) && value.length === 0) {
    return void 0;
  }
  if (Array.isArray(value)) {
    return `${value.length} item(s) selected`;
  }
  const foundItem = findItemByValue(value, items);
  return typeof foundItem === "string" ? foundItem : foundItem?.children;
}

export { findItemByValue, getSelectedItemValue, isSection, isValueEqual };
