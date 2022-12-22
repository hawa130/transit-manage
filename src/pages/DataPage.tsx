import { ColumnDef } from '@tanstack/react-table';
import { Pagination } from '@/models/Base';
import { Button, ButtonGroup, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DependencyList, ReactNode, useEffect, useRef, useState } from 'react';
import { AddIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { DataTable } from '@/components/DataTable';
import useResize from '@/hooks/useResize';
import unset from 'react-hook-form/dist/utils/unset';

export interface DataPageProps<Data extends object> {
  name: string;
  fetcher: (pagination: Pagination) => Promise<Data[]>;
  columns: ColumnDef<Data, any>[];
  createPath?: string;
  extraLeft?: ReactNode;
  extraRight?: ReactNode;
  slot?: ReactNode;
  back?: boolean;
  deps?: DependencyList;
}

function DataPage<Data extends Object>(
  {
    name,
    fetcher,
    columns,
    createPath,
    extraLeft,
    extraRight,
    slot,
    back,
    deps,
  }: DataPageProps<Data>,
) {
  const toast = useToast();
  const navigate = useNavigate();
  const [query, setQuery] = useSearchParams();
  const { height } = useResize();
  const computedPageSize = Math.floor((height - 73) / 32);

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(parseInt(query.get('page') ?? '1'));
  const [size, setSize] = useState<number>(parseInt(query.get('size') ?? computedPageSize.toString()));
  const [data, setData] = useState<Data[]>([]);

  const timer = useRef<ReturnType<typeof setTimeout>>();

  const getData = () => {
    setLoading(true);
    setError('');
    fetcher({ page, size })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setSize(computedPageSize);
    }, 500);
  }, [height]);

  useEffect(() => {
    getData();
    query.set('page', page.toString());
    query.set('size', size.toString());
    setQuery(query);
  }, [page, size, ...deps ?? []]);

  useEffect(() => {
    if (error) {
      toast({ title: error, status: 'error' });
    }
  }, [error]);

  return (
    <>
      <div className="px-4 py-3 flex justify-between items-center border-b bg-neutral-50">
        <div className="flex gap-2 items-center">
          <Text fontSize="md" fontWeight="bold">{name}</Text>
          {createPath ? (
            <IconButton
              size="xs"
              colorScheme="blackAlpha"
              variant="outline"
              onClick={() => navigate(createPath)}
              icon={<AddIcon fontSize="2xs" />}
              aria-label="创建"
            />
          ) : null}
          {extraLeft}
        </div>
        <ButtonGroup className="items-center" size="xs">
          {extraRight}
          {back ? (
            <Button
              size="xs"
              colorScheme="blackAlpha"
              variant="outline"
              onClick={() => {
                navigate(-1);
              }}
            >
              返回
            </Button>
          ) : null}
          <div className="text-gray-600 text-sm flex gap-1">
            第
            <div className="relative">
              <div className="text-center w-full invisible">{page}</div>
              <Input
                textAlign="center" position="absolute" top={0} left={0}
                size="sm" htmlSize={2} variant="unstyled"
                value={page}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value > 0) {
                    setPage(value);
                  }
              }}
              />
            </div>
            页
          </div>
          <IconButton
            colorScheme="twitter"
            variant="outline"
            aria-label="上一页"
            disabled={page === 1 || loading}
            onClick={() => setPage(page - 1)}
            icon={<ChevronLeftIcon fontSize="lg" />}
          />
          <IconButton
            colorScheme="twitter"
            variant="outline"
            aria-label="下一页"
            onClick={() => setPage(page + 1)}
            disabled={data.length < size || loading}
            icon={<ChevronRightIcon fontSize="lg" />}
          />
        </ButtonGroup>
      </div>
      {slot}
      {loading ? (
        <div className="h-4/5 flex items-center justify-center">
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
        </div>
      ) : (
        data.length ? (
          <DataTable
            columns={columns}
            data={data}
          />
        ) : (
          <div className="h-4/5 flex items-center justify-center">
            <Text className="text-gray-600 text-sm">无数据</Text>
          </div>
        )
      )}
    </>
  );
}

export default DataPage;
