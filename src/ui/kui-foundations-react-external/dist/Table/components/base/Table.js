/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsxs, jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { TableBody } from '../composed/TableBody.js';
import { TableDataCell } from '../composed/TableDataCell.js';
import { TableHead } from '../composed/TableHead.js';
import { TableHeaderCell } from '../composed/TableHeaderCell.js';
import { TableRoot } from '../composed/TableRoot.js';
import { TableRow } from '../composed/TableRow.js';

const Table = forwardRef(
  ({ columns, rows, attributes, ...props }, ref) => {
    return /* @__PURE__ */ jsxs(TableRoot, { ...mergeProps({ ref }, props), children: [
      /* @__PURE__ */ jsx(TableHead, { ...attributes?.TableHead, children: /* @__PURE__ */ jsx(TableRow, { ...attributes?.TableRow, children: columns.map((column, index) => {
        if (typeof column === "string") {
          return /* @__PURE__ */ jsx(TableHeaderCell, { children: column }, index);
        }
        return /* @__PURE__ */ jsx(
          TableHeaderCell,
          {
            onClick: () => column.onColumnSelect?.({ columnIndex: index }),
            ...column.attributes?.TableHeaderCell,
            children: column.children ?? column.slotHeader
          },
          index
        );
      }) }) }),
      /* @__PURE__ */ jsx(TableBody, { ...attributes?.TableBody, children: rows.map((row, rowIndex) => /* @__PURE__ */ jsx(
        TableRow,
        {
          onClick: () => row.onRowSelect?.({ rowId: row.id }),
          selected: row.selected,
          ...row.attributes?.TableRow,
          children: row.cells.map((cell, columnIndex) => {
            if (typeof cell === "string") {
              return /* @__PURE__ */ jsx(TableDataCell, { children: cell }, columnIndex);
            }
            return /* @__PURE__ */ jsx(
              TableDataCell,
              {
                onClick: () => cell.onCellSelect?.({
                  rowId: row.id,
                  columnIndex
                }),
                ...cell.attributes?.TableDataCell,
                children: cell.children ?? cell.slotContent
              },
              columnIndex
            );
          })
        },
        row.id ?? rowIndex
      )) })
    ] });
  }
);
Table.displayName = "Table";

export { Table };
