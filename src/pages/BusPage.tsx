import { createColumnHelper } from '@tanstack/react-table';
import Bus from '@/models/Bus';
import DataPage from '@/pages/DataPage';
import { Link } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const columnsHelper = createColumnHelper<Bus>();

const columns = [
  columnsHelper.accessor('number', {
    header: '车牌号',
    cell: (row) => (
      <Link as={RouterLink} to={`/bus/${row.getValue()}`} color="blue.600">{row.getValue()}</Link>
    ),
  }),
  columnsHelper.accessor('routeId', {
    header: '线路',
  }),
  columnsHelper.accessor('brand', {
    header: '品牌',
  }),
  columnsHelper.accessor('capacity', {
    header: '座位数',
  }),
  columnsHelper.accessor('factoryYear', {
    header: '车龄',
    cell: (row) => `${new Date().getFullYear() - row.getValue()} 年`,
  })
];

function BusPage() {
  return (
    <DataPage
      name="车辆"
      fetcher={Bus.list}
      columns={columns}
      createPath="/bus/new"
    />
  );
}

export default BusPage;
