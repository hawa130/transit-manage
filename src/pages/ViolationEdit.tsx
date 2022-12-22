import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, ButtonGroup, Input, Select, Tag, Text, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { CheckIcon } from '@chakra-ui/icons';
import DatePicker from 'react-datepicker';
import { EditPageProps, FormItem } from '@/pages/MemberEdit';
import ViolationRecord from '@/models/ViolationRecord';
import { useAuth } from '@/utils/Auth';
import Violation from '@/models/Violation';
import Member from '@/models/Member';
import Bus from '@/models/Bus';
import Fleet from '@/models/Fleet';

function ViolationEdit({ type }: EditPageProps) {
  const {
    reset,
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    control,
    setValue,
  } = useForm<ViolationRecord>();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();

  const [current, setCurrent] = useState<ViolationRecord | undefined>();
  const [driver, setDriver] = useState<Member | undefined>();
  const [inputDriverId, setInputDriverId] = useState<number | undefined>();
  const [routeId, setRouteId] = useState<number | undefined>(current?.routeId);
  const [fleet, setFleet] = useState<Fleet | undefined>();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [recorderName, setRecorderName] = useState<string>(user?.name ?? '--');

  const getData = () => {
    if (!id) {
      return;
    }

    const idNumber = parseInt(id);
    if (isNaN(idNumber)) {
      return;
    }

    ViolationRecord.get(idNumber)
      .then((res) => {
        reset(res);
        setCurrent(() => res);
        setInputDriverId(res.driverId);
        setRouteId(res.routeId);
        res.recorder().then((r) => setRecorderName(r.name));
      })
      .catch((err) => toast({ title: '读取失败', description: err.message, status: 'error' }));
  };

  const getViolations = () => {
    Violation.list()
      .then((res) => setViolations(() => res))
      .catch((err) => toast({ title: '读取失败', description: err.message, status: 'error' }));
  }

  const getBuses = () => {
    if (!routeId) {
      return;
    }
    Bus.listByRoute(routeId)
      .then((res) => setBuses(() => res))
      .catch((err) => toast({ title: '读取失败', description: err.message, status: 'error' }));
  }

  const getDriver = () => {
    ViolationRecord.getDriver(inputDriverId)
      .then((res) => {
        setDriver(res);
        setRouteId(res.routeId);
      })
      .catch((err) => setDriver(undefined));
  }

  const getFleet = () => {
    ViolationRecord.getRoute(routeId)
      .then((res) => {
        res.fleet().then((fleet) => {
          setValue('fleetId', fleet.id);
          setFleet(fleet);
        });
      })
      .catch((err) => setFleet(undefined));
  }

  useEffect(() => {
    getViolations();
  }, []);

  useEffect(() => {
    getData();
  }, [id, type]);

  useEffect(() => {
    getDriver();
  }, [inputDriverId]);

  useEffect(() => {
    setValue('recorderId', user?.id);
  }, [user?.id]);

  useEffect(() => {
    setValue('routeId', routeId);
    getFleet();
    getBuses();
  }, [routeId]);

  useEffect(() => {
    setValue('busNumber', current?.busNumber);
  }, [buses])

  const onSubmit = handleSubmit(async (data) => {
    if (type === 'new') {
      const res = await ViolationRecord.create(data)
        .then((res) => {
          toast({ title: '创建成功', status: 'success' });
          navigate(`/violation/${res.id}`, { replace: true });
        })
        .catch((err) => {
          toast({ title: '创建失败', description: err.message, status: 'error' });
        });
    } else {
      const res = await current?.update(data)
        .then((res) => {
          toast({ title: '修改成功', status: 'success' });
          getData();
        })
        .catch((err) => toast({ title: '修改失败', description: err.message, status: 'error' }));
    }
  });

  return (
    <>
      <div className="px-4 py-2 flex justify-between items-center border-b bg-neutral-50">
        <div className="flex gap-2 items-center">
          <Text fontSize="md" fontWeight="bold">
            {type === 'new' ? '添加' : current?.driverId === user?.id ? '查看' : '修改'}违章记录
          </Text>
        </div>
        <ButtonGroup className="items-center" size="sm">
          <Button colorScheme="twitter" variant="outline" onClick={() => navigate(-1)}>返回</Button>
          {current?.driverId === user?.id ? null : (
            <Button
              onClick={onSubmit}
              variant="solid"
              colorScheme="twitter"
              isLoading={isSubmitting}
              leftIcon={<CheckIcon />}
            >
              保存
            </Button>
          )}
        </ButtonGroup>
      </div>
      <form className="p-4 flex flex-col gap-3" onSubmit={onSubmit}>
        <div className="grid grid-cols-3 gap-4">
          <FormItem field="joinedAt" label="违章时间">
            <Controller
              name="time"
              control={control}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  showTimeInput
                  selected={value}
                  onChange={onChange}
                  placeholderText="默认为现在"
                  dateFormat="yyyy-MM-dd HH:mm"
                />
              )}
            />
          </FormItem>
          <FormItem field="driverId" label="工号" error={errors.driverId} required>
            <Controller
              name="driverId"
              control={control}
              rules={{ required: '工号不能为空' }}
              render={({ field: { value, onChange } }) => (
                <Input
                  value={value}
                  onChange={({ target }) => {
                    onChange(target.value);
                    const parsedId = parseInt(target.value);
                    if (!isNaN(parsedId)) {
                      setInputDriverId(() => parsedId);
                    }
                  }}
                />
              )}
            />
          </FormItem>
          <FormItem field="name" label="姓名" isReadOnly>
            <div className="py-2">
              {driver ? (
                <div className="flex items-center gap-2">
                  {driver.name}
                  <Tag size="sm" colorScheme="twitter">{driver.job}</Tag>
                </div>
              ) : '--'}
            </div>
          </FormItem>
          <FormItem className="col-span-2" field="location" label="违章地点" error={errors.location} required>
            <Input {...register('location', { required: '违章地点不能为空' })} />
          </FormItem>
          <FormItem field="busNumber" label="车牌号" error={errors.busNumber} required>
            <Select {...register('busNumber', { required: '车牌号不能为空' })}>
              <option value="" hidden>请选择</option>
              {buses.map((bus) => (
                <option key={bus.number} value={bus.number}>{bus.number}</option>
              ))}
            </Select>
          </FormItem>
          <FormItem field="violationName" label="违章名称" error={errors.violationName} required>
            <Select {...register('violationName', { required: '违章名称不能为空' })}>
              <option value="" hidden>请选择</option>
              {violations.map((v) => (
                <option key={v.name} value={v.name}>{v.name}</option>
              ))}
            </Select>
          </FormItem>
          <FormItem field="recorderId" label="记录人工号" error={errors.recorderId} isReadOnly>
            <Input variant="filled" {...register('recorderId', { required: '记录人不能为空' })} />
          </FormItem>
          <FormItem field="recorderName" label="记录人姓名" isReadOnly>
            <div className="py-2">
              {recorderName}
            </div>
          </FormItem>
          <FormItem field="routeId" label="线路" isReadOnly>
            <Input variant="filled" {...register('routeId', { required: false })} />
          </FormItem>
          <FormItem field="fleetId" label="车队编号" isReadOnly>
            <Input variant="filled" {...register('fleetId', { required: false })} />
          </FormItem>
          <FormItem field="fleet" label="车队" isReadOnly>
            <div className="py-2">
              {fleet?.name}
            </div>
          </FormItem>
        </div>
      </form>
    </>
  );
}

export default ViolationEdit;
