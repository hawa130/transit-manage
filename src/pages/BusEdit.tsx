import { Controller, FieldError, useForm } from 'react-hook-form';
import {
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Text,
  useToast,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { FormControlProps } from '@chakra-ui/form-control';
import { useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import 'styles/date-picker.css';
import AsyncCell from '@/components/AsyncCell';
import Bus from '@/models/Bus';
import { EditPageProps } from '@/pages/MemberEdit';

export type EditType = 'new' | 'edit';

function BusEdit({ type }: EditPageProps) {
  const {
    reset,
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    control,
  } = useForm<Bus>();
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const [current, setCurrent] = useState<Bus | undefined>();

  const getData = () => {
    if (!id) {
      return;
    }

    Bus.get(id)
      .then((res) => {
        reset(res);
        setCurrent(() => res);
      })
      .catch((err) => toast({ title: '读取失败', description: err.message, status: 'error' }));
  };

  useEffect(() => {
    getData();
  }, [id, type]);

  const onSubmit = handleSubmit(async (data) => {
    if (type === 'new') {
      const res = await Bus.create(data)
        .then((res) => {
          toast({ title: '创建成功', status: 'success' });
          navigate(`/bus/${res.number}`, { replace: true });
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

  const RouteAndFleet = ({ initialRouteId }: { initialRouteId?: number }) => {
    const [routeId, setRouteId] = useState<number | undefined>(initialRouteId);

    return (
      <>
        <FormItem field="routeId" label="线路">
          <Controller
            name="routeId"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Input
                value={value}
                onChange={({ target }) => {
                  onChange(target.value);
                  const parsedRouteId = parseInt(target.value);
                  if (!isNaN(parsedRouteId)) {
                    setRouteId(parsedRouteId);
                  }
                }}
              />
            )}
          />
        </FormItem>
        <div className="grid-cols-2 grid gap-4">
          <FormItem className="col-span-1" field="fleet" label="车队" isReadOnly>
            <div className="py-2">
              <AsyncCell
                func={async () => await Bus.getRoute(routeId).then(r => r.fleet().then(f => f.name))}
                deps={[routeId]}
              />
            </div>
          </FormItem>
          <FormItem className="col-span-1" field="fleet" label="路队长" isReadOnly>
            <div className="py-2">
              <AsyncCell
                func={async () => await Bus.getRoute(routeId).then(r => r.captain().then(c => c.name))}
                deps={[routeId]}
              />
            </div>
          </FormItem>
        </div>
      </>
    );
  };

  return (
    <>
      <div className="px-4 py-2 flex justify-between items-center border-b bg-neutral-50">
        <div className="flex gap-2 items-center">
          <Text fontSize="md" fontWeight="bold">{type === 'new' ? '添加' : '修改'}车辆</Text>
        </div>
        <ButtonGroup className="items-center" size="sm">
          <Button colorScheme="twitter" variant="outline" onClick={() => navigate(-1)}>返回</Button>
          <Button
            onClick={onSubmit}
            variant="solid"
            colorScheme="twitter"
            isLoading={isSubmitting}
            leftIcon={<CheckIcon />}
          >
            保存
          </Button>
        </ButtonGroup>
      </div>
      <form className="p-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <FormItem field="number" label="车牌号" error={errors.number} required>
            <Input {...register('number', { required: '车牌号不能为空' })} />
          </FormItem>
          <FormItem field="brand" label="品牌" required>
            <Input {...register('brand', { required: '品牌不能为空' })} />
          </FormItem>
          <FormItem field="capacity" label="座位数" required>
            <Input {...register('capacity', {
              required: '座位数不能为空',
              pattern: { value: /^\d+$/, message: '座位数只能为数值' },
            })} />
          </FormItem>
          <FormItem field="factoryYear" label="开始使用年份" error={errors.factoryYear} required>
            <Input {...register('factoryYear', {
              required: '年份不能为空',
              pattern: { value: /^\d{4}$/, message: '年份只能为数字' },
            })} />
          </FormItem>
          <RouteAndFleet initialRouteId={current?.routeId} />
        </div>
      </form>
    </>
  );
}

export default BusEdit;

export interface FormItemProps extends FormControlProps {
  field: string;
  label: string;
  error?: FieldError;
  required?: boolean;
}

export function FormItem({ field, label, error, required, children, ...props }: FormItemProps) {
  return (
    <FormControl size="xs" id={field} colorScheme="twitter" isInvalid={!!error} isRequired={required} {...props}>
      <FormLabel htmlFor={field}>{label}</FormLabel>
      {children}
      <FormErrorMessage>{error ? error.message : null}</FormErrorMessage>
    </FormControl>
  );
}
