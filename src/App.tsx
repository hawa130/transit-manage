import { FC, useEffect } from 'react';
import { Button, Tag, Text } from '@chakra-ui/react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/utils/Auth';

interface NavItem {
  name: string;
  path: string;
}

const NavItems: NavItem[] = [
  {
    name: '统计',
    path: '/',
  },
  {
    name: '公司',
    path: '/company',
  },
  {
    name: '车队',
    path: '/fleet',
  },
  {
    name: '员工',
    path: '/member',
  },
  {
    name: '车辆',
    path: '/bus',
  },
  {
    name: '线路',
    path: '/route',
  },
  {
    name: '站点',
    path: '/stop',
  },
  {
    name: '违章记录',
    path: '/violation',
  },
  {
    name: '违章查询',
    path: '/violation-search',
  }
]

const App: FC = () => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  const start = '/' + pathname.split('/')[1] ?? '';
  const navigate = useNavigate();

  return (
    <main className="flex">
      <section className="flex-shrink-0 h-screen">
        <nav className="p-4 flex flex-col h-full bg-neutral-100 overflow-auto border-r">
          <div className="flex justify-center items-center gap-2">
            <Tag size="sm" colorScheme="twitter">{user.job}</Tag><Text>{user.name}</Text>
          </div>
          <div className="mt-4 flex flex-col flex-grow gap-2">
            {NavItems.map((item) => (
              <Button
                className={start === item.path ? 'shadow-lg shadow-blue-200' : undefined}
                colorScheme="twitter"
                variant={start === item.path ? 'solid' : 'ghost'}
                key={item.path}
                onClick={() => navigate(item.path)}
              >
                {item.name}
              </Button>
            ))}
          </div>
          <div className="mt-4">
            <Button
              className="block w-full"
              size="sm"
              colorScheme="red"
              variant="ghost"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              退出
            </Button>
          </div>
        </nav>
      </section>
      <section className="flex-grow h-screen">
        <div className="h-full overflow-auto">
          <Outlet />
        </div>
      </section>
    </main>
  );
};

export default App;
