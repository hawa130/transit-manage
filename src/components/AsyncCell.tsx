import { DependencyList, useEffect, useState } from 'react';

export interface AsyncCellProps<T = any> {
  func: () => Promise<T>;
  deps?: DependencyList;
  onSuccess?: (data: T) => void;
  onError?: (err: Error) => void;
}

function AsyncCell<T = any>({ func, deps, onSuccess, onError }: AsyncCellProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [data, setData] = useState<any>();

  useEffect(() => {
    setError('');
    func()
      .then((res: T) => {
        setData(res);
        onSuccess?.(res);
      })
      .catch((err) => {
        setError(err.message);
        onError?.(err);
      })
      .finally(() => setLoading(false));
  }, [deps]);

  return (
    loading
      ? <>'加载中...'</>
      : error
        ? <>{error}</>
        : <>{data}</>
  )
}

export default AsyncCell;
