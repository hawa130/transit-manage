import { Button, Input, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/utils/Auth';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

interface LoginRequest {
  username: string;
  password: string;
}

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const from = location.state?.from ?? '/';

  const [request, setRequest] = useState<LoginRequest>({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    login(request.username, request.password)
      .then((user) => {
        toast({ title: `欢迎回来，${user.name}！`, status: 'success', duration: 1200 });
        setTimeout(() => {
          navigate(from);
          setLoading(false);
        }, 100);
      })
      .catch((err) => {
        toast({ title: '登录失败', description: err.message, status: 'error' });
        setLoading(false);
      })
  };

  return (
    <div className="h-screen flex items-center justify-center bg-neutral-100">
      <div className="w-80 bg-white rounded-xl shadow-lg p-6">
        <div className="text-xl font-bold text-center">系统登录</div>
        <div className="mt-4">
          <Input
            value={request.username}
            onChange={(e) => setRequest({ ...request, username: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="工号"
          />
          <Input
            value={request.password}
            onChange={(e) => setRequest({ ...request, password: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="mt-4" placeholder="密码"
          />
          <Button
            isLoading={loading}
            colorScheme="twitter"
            className="w-full mt-4"
            onClick={handleLogin}
          >
            登录
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Login;
