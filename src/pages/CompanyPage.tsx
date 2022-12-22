import { createColumnHelper } from '@tanstack/react-table';
import Company from '@/models/Company';
import DataPage from '@/pages/DataPage';

const columnHelper = createColumnHelper<Company>();

const columns = [
  columnHelper.accessor('name', {
    header: '公司名称',
  }),
  columnHelper.accessor('place', {
    header: '公司地址',
    cell: (row) => row.getValue() || '未填写',
  }),
  columnHelper.accessor('createdAt', {
    header: '成立时间',
    cell: (row) => row.getValue().toLocaleDateString(),
  }),
];

function CompanyPage() {
  return (
    <DataPage
      name="公司"
      fetcher={Company.list}
      columns={columns}
    />
  );
}

export default CompanyPage;
