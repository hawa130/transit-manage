import { useAuth } from '@/utils/Auth';
import ViolationRecord, { ViolationRecordStatType } from '@/models/ViolationRecord';
import { useEffect, useState } from 'react';
import { HStack, Input, Stat, StatHelpText, StatLabel, StatNumber, Text, useToast } from '@chakra-ui/react';
import Fleet from '@/models/Fleet';
import Member from '@/models/Member';
import DatePicker from 'react-datepicker';

function StatisticsPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [fleetID, setFleetID] = useState<number | undefined>();
  const [fleetName, setFleetName] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>(new Date('2010-01-01'));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [statistic, setStatistic] = useState<ViolationRecordStatType[]>([]);

  const queryStatistics = (fleetID: number) => {
    Fleet.get(fleetID)
      .then((res) => setFleetName(res.name ?? '无名称'))
      .catch((err) => setFleetName(err.message));
    ViolationRecord.statByFleet(startDate, endDate, fleetID)
      .then(setStatistic)
      .catch((err) => toast({ title: '查询失败', description: err.message, status: 'error' }));
  };

  const getUserFleet = () => {
    if (!user) {
      return;
    }
    if (user.job === '队长') {
      Fleet.getByCaptain(user.id).then((fleet) => {
        setFleetID(fleet.id);
        setFleetName(fleet.name ?? '无名称');
      });
      return;
    }
    Member.getRoute(user.routeId)
      .then((route) => route.fleet().then((fleet) => {
        setFleetID(fleet.id);
        setFleetName(fleet.name ?? '无名称');
      }));
  };

  useEffect(() => {
    if (fleetID != undefined) {
      queryStatistics(fleetID);
    }
  }, [fleetID, startDate, endDate]);

  useEffect(() => {
    if (user) {
      getUserFleet();
    }
  }, []);

  return (
    <>
      <div className="px-4 py-3 flex justify-between items-center border-b bg-neutral-50">
        <Text fontSize="md" fontWeight="bold">车队违章统计</Text>
        <div className="flex items-center gap-4">
          <HStack spacing={0}>
            <Text>车队：</Text>
            <Text fontWeight="bold">{fleetName}</Text>
          </HStack>
          <HStack spacing={0}>
            <Text>编号：</Text>
            <div className="relative">
              <div className="text-center w-full invisible">{fleetID}</div>
              <Input
                textAlign="center" position="absolute" top={0} left={0} variant="unstyled"
                value={fleetID}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 0) {
                    setFleetID(value);
                  }
                }}
              />
            </div>
          </HStack>
        </div>
      </div>
      <div className="pt-2 px-4 flex items-center justify-between">
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
          <Text fontWeight="bold">车队编号</Text>
          <Input
            w={24}
            value={fleetID}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value) && value >= 0) {
                setFleetID(value);
              }
            }}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 py-3">
        {statistic.length ? (
          statistic.map((stat) => (
            <div key={stat.violationName} className="bg-neutral-50 rounded-lg border">
              <Stat className="pt-3 pb-2 px-4">
                <StatLabel>{stat.violationName}</StatLabel>
                <div className="flex items-end gap-1">
                  <StatNumber>{stat.count}</StatNumber>
                  <StatHelpText mb={1}>次</StatHelpText>
                </div>
              </Stat>
            </div>
          ))
        ) : (
          <div className="col-span-4 text-center text-neutral-500 py-48">
            无违章记录
          </div>
        )}
      </div>
    </>
  );
}

export default StatisticsPage;
