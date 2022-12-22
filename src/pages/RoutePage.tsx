import { createColumnHelper } from '@tanstack/react-table';
import Route from '@/models/Route';
import AsyncCell from '@/components/AsyncCell';
import DataPage from '@/pages/DataPage';

const columnsHelper = createColumnHelper<Route>();

const columns = [
  columnsHelper.accessor('id', {
    header: '线路编号',
  }),
  columnsHelper.accessor('captainId', {
    header: '路队长',
    cell: (row) => (
      <AsyncCell
        func={async () => await Route.getCaptain(row.getValue()).then(c => c.name)}
        deps={[row.getValue()]}
      />
    ),
  }),
  columnsHelper.accessor('fleetId', {
    header: '车队',
    cell: (row) => (
      <AsyncCell
        func={async () => await Route.getFleet(row.getValue()).then(f => f.name)}
        deps={[row.getValue()]}
      />
    ),
  }),
  columnsHelper.accessor('createdAt', {
    header: '创建时间',
    cell: (row) => row.getValue().toLocaleDateString(),
  }),
];

function RoutePage() {
  return (
    <DataPage
      name="线路"
      fetcher={Route.list}
      columns={columns}
    />
  );
}

export default RoutePage;
