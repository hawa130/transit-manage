import { createColumnHelper } from '@tanstack/react-table';
import ViolationRecord from '@/models/ViolationRecord';
import AsyncCell from '@/components/AsyncCell';
import DataPage from '@/pages/DataPage';
import { Link } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const columnsHelper = createColumnHelper<ViolationRecord>();

const columns = [
  columnsHelper.accessor('id', {
    header: '编号',
    cell: (row) => (
      <Link as={RouterLink} to={`/violation/${row.row.original.id}`} color="blue.600">{row.getValue()}</Link>
    ),
  }),
  columnsHelper.accessor('driverId', {
    header: '驾驶员',
    cell: (row) => (
      <AsyncCell
        func={async () => await ViolationRecord.getDriver(row.getValue()).then(d => d.name)}
        deps={[row.getValue()]}
      />
    )
  }),
  columnsHelper.accessor('busNumber', {
    header: '车牌号',
  }),
  columnsHelper.accessor('violationName', {
    header: '违章名称',
  }),
  columnsHelper.accessor('time', {
    header: '违章时间',
    cell: (row) => row.getValue().toLocaleDateString(),
  }),
]

function ViolationPage() {
  return (
    <DataPage
      name="违章记录"
      fetcher={ViolationRecord.list}
      columns={columns}
      createPath="/violation/new"
    />
  );
}

export default ViolationPage;
