import * as React from 'react';
import { withComponents } from '@devexpress/dx-react-core';
import { TableGroupRow as TableGroupRowBase } from '@devexpress/dx-react-grid';
import { TableGroupCell as Cell } from '../templates/table-group-row-cell';
import { TableRow as Row } from '../templates/table-row';

const TableGroupRowWithIndent = props => <TableGroupRowBase indentColumnWidth={48} {...props} />;
TableGroupRowWithIndent.components = TableGroupRowBase.components;

export const TableGroupRow = withComponents({ Row, Cell })(TableGroupRowWithIndent);

TableGroupRow.COLUMN_TYPE = TableGroupRowBase.COLUMN_TYPE;
TableGroupRow.ROW_TYPE = TableGroupRowBase.ROW_TYPE;
