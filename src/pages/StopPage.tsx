import { createColumnHelper } from '@tanstack/react-table';
import Stop from '@/models/Stop';
import DataPage from '@/pages/DataPage';

const columnHelper = createColumnHelper<Stop>();

const columns = [
  columnHelper.accessor('name', {
    header: '名称',
  }),
  columnHelper.accessor('location', {
    header: '地点',
  })
];

function StopPage() {
  return (
    <DataPage
      name="站点"
      fetcher={Stop.list}
      columns={columns}
    />
  );
}

export default StopPage;
