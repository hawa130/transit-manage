import { createColumnHelper } from '@tanstack/react-table';
import Fleet from '@/models/Fleet';
import DataPage from '@/pages/DataPage';
import AsyncCell from '@/components/AsyncCell';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { IconButton, Link } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

const columnHelper = createColumnHelper<Fleet>();

const columns = [
  columnHelper.accessor('id', {
    header: '车队编号',
  }),
  columnHelper.accessor('name', {
    header: '车队名称',
    cell: (row) => (
      <Link as={RouterLink} to={`/fleet/${row.row.original.id}`} color="blue.600">{row.getValue()}</Link>
    ),
  }),
  columnHelper.accessor('captainId', {
    header: '队长',
    cell: (row, ) => (
      <AsyncCell
        func={async () => await Fleet.getCaptain(row.getValue()).then(c => c.name)}
        deps={[row.getValue()]}
      />
    ),
  }),
  columnHelper.accessor('createdAt', {
    header: '成立时间',
    cell: (row) => row.getValue().toLocaleDateString(),
  }),
]

function FleetPage() {
  return (
    <DataPage
      name="车队"
      fetcher={Fleet.list}
      columns={columns}
    />
  );
}

export default FleetPage;
