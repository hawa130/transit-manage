import { Controller, FieldError, useForm } from 'react-hook-form';
import Member from '@/models/Member';
import {
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { FormControlProps } from '@chakra-ui/form-control';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'styles/date-picker.css';
import AsyncCell from '@/components/AsyncCell';

export type EditType = 'new' | 'edit';

export interface EditPageProps {
  type: EditType;
  idNotNumeric?: boolean;
}

function MemberEdit({ type }: EditPageProps) {
  const {
    reset,
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    control,
  } = useForm<Member>();
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const [current, setCurrent] = useState<Member | undefined>();

  const getData = () => {
    if (!id) {
      return;
    }

    const idNumber = parseInt(id);
    if (isNaN(idNumber)) {
      return;
    }

    Member.get(idNumber)
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
      const res = await Member.create(data)
        .then((res) => {
          toast({ title: '创建成功', status: 'success' });
          navigate(`/member/${res.id}`, { replace: true });
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
                onChange={({ target}) => {
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
        <FormItem className="col-span-3" field="fleet" label="车队" isReadOnly>
          <div className="py-2">
            <AsyncCell
              func={async () => await Member.getRoute(routeId).then(r => r.fleet().then(f => f.name))}
              deps={[routeId]}
            />
          </div>
        </FormItem>
      </>
    );
  };

  return (
    <>
      <div className="px-4 py-2 flex justify-between items-center border-b bg-neutral-50">
        <div className="flex gap-2 items-center">
          <Text fontSize="md" fontWeight="bold">{type === 'new' ? '添加' : '修改'}员工</Text>
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
      <form className="p-4 flex flex-col gap-3" onSubmit={onSubmit}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FormItem className="col-span-2" field="name" label="姓名" error={errors.name} required>
            <Input {...register('name', { required: '姓名不能为空' })} />
          </FormItem>
          <FormItem field="id" label="工号" isReadOnly>
            <Input variant="filled" {...register('id', { required: false })} />
          </FormItem>
          <FormItem field="job" label="职位" isReadOnly>
            <Input variant="filled" {...register('job', { required: false })} />
          </FormItem>
          <FormItem className="col-span-2" field="phone" label="手机号" error={errors.phone} required>
            <Input {...register('phone', {
              required: '手机号不能为空',
              pattern: { value: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
            })} />
          </FormItem>
          <FormItem field="birthYear" label="出生年份" error={errors.birthYear} required>
            <Input {...register('birthYear', {
              required: '出生年份不能为空',
              pattern: { value: /^\d{4}$/, message: '出生年份只能为数字' },
            })} />
          </FormItem>
          <FormItem field="gender" label="性别" error={errors.gender} required>
            <Controller
              name="gender"
              control={control}
              rules={{ required: '性别不能为空' }}
              render={({ field: { onChange, value } }) => (
                <RadioGroup className="py-2" value={value} onChange={onChange}>
                  <Stack direction="row">
                    <Radio value="男">男</Radio>
                    <Radio value="女">女</Radio>
                  </Stack>
                </RadioGroup>
              )}
            />
          </FormItem>
          <FormItem className="col-span-2" field="idNumber" label="身份证号" error={errors.idNumber} required>
            <Input {...register('idNumber', {
              required: '身份证号不能为空',
              pattern: { value: /^\d{17}(X|\d)$/, message: '身份证号格式不正确' },
            })} />
          </FormItem>
          <FormItem field="origin" label="籍贯" error={errors.origin} required>
            <Input {...register('origin', { required: '籍贯不能为空' })} />
          </FormItem>
          <FormItem field="joinedAt" label="入职时间">
            <Controller
              name="joinedAt"
              control={control}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  showTimeInput
                  selected={value}
                  onChange={onChange}
                  placeholderText="默认为现在"
                  dateFormat="yyyy-MM-dd"
                />
              )}
            />
          </FormItem>
          <RouteAndFleet initialRouteId={current?.routeId} />
        </div>
      </form>
    </>
  );
}

export default MemberEdit;

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
