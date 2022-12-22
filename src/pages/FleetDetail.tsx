import { createColumnHelper } from '@tanstack/react-table';
import DataPage from '@/pages/DataPage';
import Member from '@/models/Member';
import { Button, IconButton, Link } from '@chakra-ui/react';
import { Link as RouterLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AddIcon } from '@chakra-ui/icons';

const columnsHelper = createColumnHelper<Member>();

const columns = [
  columnsHelper.accessor('id', {
    header: '工号',
  }),
  columnsHelper.accessor('name', {
    header: '姓名',
    cell: (row) => (
      <Link as={RouterLink} to={`/member/${row.row.original.id}`} color="blue.600">{row.getValue()}</Link>
    ),
  }),
  columnsHelper.accessor('gender', {
    header: '性别',
  }),
  columnsHelper.accessor('birthYear', {
    header: '年龄',
    cell: (row) => new Date().getFullYear() - row.getValue(),
  }),
  columnsHelper.accessor('job', {
    header: '职位',
  }),
  columnsHelper.accessor('routeId', {
    header: '线路',
    cell: (row) => row.getValue() ?? '--',
  }),
];

function FleetDetail() {
  const navigate = useNavigate();

  const { id } = useParams();
  if (!id) {
    return null;
  }
  const idNumber = parseInt(id);
  if (!idNumber) {
    return null;
  }

  return (
    <DataPage
      name="车队司机"
      fetcher={async (p) => await Member.listByFleet(idNumber, p)}
      columns={columns}
      back
    />
  );
}

export default FleetDetail;
