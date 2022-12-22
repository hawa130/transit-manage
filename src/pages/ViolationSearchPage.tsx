import { createColumnHelper } from '@tanstack/react-table';
import ViolationRecord from '@/models/ViolationRecord';
import DataPage from '@/pages/DataPage';
import { Input, Link, Text } from '@chakra-ui/react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/utils/Auth';
import DatePicker from 'react-datepicker';
import AsyncCell from '@/components/AsyncCell';

const columnsHelper = createColumnHelper<ViolationRecord>();

const columns = [
  columnsHelper.accessor('id', {
    header: '编号',
    cell: (row) => (
      <Link as={RouterLink} to={`/violation/${row.row.original.id}`} color="blue.600">{row.getValue()}</Link>
    ),
  }),
  columnsHelper.accessor('location', {
    header: '违章地点',
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
];

function ViolationPage() {
  const { user } = useAuth();
  if (!user) {
    return null;
  }
  const [query, setQuery] = useSearchParams();

  const [driverId, setDriverId] = useState<number>(query.has('driver') ? Number(query.get('driver')) : user.id);
  const [startDate, setStartDate] = useState<Date>(new Date(query.get('start') || '2010-01-01'));
  const [endDate, setEndDate] = useState<Date>(query.has('end') ? new Date(query.get('end')!) : new Date());

  const [fontSize, setFontSize] = useState('md');

  useEffect(() => {
    query.set('driver', String(driverId));
    query.set('start', startDate.toISOString());
    query.set('end', endDate.toISOString());
    setQuery(query);
  }, [driverId, startDate, endDate]);

  return (
    <DataPage
      name="违章查询"
      fetcher={async (pagination) => await ViolationRecord.listByDriver(startDate, endDate, driverId, pagination)}
      deps={[driverId, startDate, endDate]}
      columns={columns}
      slot={
        <div className="px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Text fontWeight="bold">时间范围</Text>
            <div className="w-[180px]">
              <DatePicker
                showTimeInput
                selected={startDate}
                onChange={(date) => setStartDate(date ?? new Date())}
                dateFormat="yyyy-MM-dd HH:mm"
              />
            </div>
            <Text>～</Text>
            <div className="w-[180px]">
              <DatePicker
                showTimeInput
                selected={endDate}
                onChange={(date) => setEndDate(date ?? new Date())}
                dateFormat="yyyy-MM-dd HH:mm"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Text fontWeight="bold">驾驶员</Text>
            <Input
              w={24}
              value={driverId}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value >= 0) {
                  setDriverId(value);
                }
              }}
            />
            <Text maxWidth={24} noOfLines={2} fontSize={fontSize}>
              <AsyncCell
                func={async () => await ViolationRecord.getDriver(driverId).then(d => d.name)}
                deps={[driverId]}
                onSuccess={(name) => setFontSize(name.length > 5 ? 'sm' : 'md')}
                onError={() => setFontSize('xs')}
              />
            </Text>
          </div>
        </div>
      }
    />
  );
}

export default ViolationPage;
