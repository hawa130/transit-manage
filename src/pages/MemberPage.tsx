import { createColumnHelper } from '@tanstack/react-table';
import Member from '@/models/Member';
import DataPage from '@/pages/DataPage';
import AsyncCell from '@/components/AsyncCell';
import Route from '@/models/Route';
import Fleet from '@/models/Fleet';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@chakra-ui/react';

const columnsHelper = createColumnHelper<Member>();

function MemberPage() {
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
    columnsHelper.display({
      id: 'fleet',
      header: '车队',
      cell: (props) => (
        <AsyncCell
          func={async () => {
            if (props.row.original.job === '队长') {
              return await Fleet.getByCaptain(props.row.original.id).then(f => f.name);
            }
            const route = await Member.getRoute(props.row.original.routeId);
            return await Route.getFleet(route.fleetId).then(f => f.name);
          }}
          deps={[props.row.original.routeId]}
        />
      ),
    }),
  ];

  return (
    <DataPage
      name="员工"
      fetcher={Member.list}
      columns={columns}
      createPath="/member/new"
    />
  );
}

export default MemberPage;
