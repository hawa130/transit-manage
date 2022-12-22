import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './samples/node-api';
import 'styles/index.css';
import { connectDB } from '@/database';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from '@/pages/Login';
import Root from '@/Root';
import AuthRequired from '@/utils/AuthRequired';
import CompanyPage from '@/pages/CompanyPage';
import FleetPage from '@/pages/FleetPage';
import MemberPage from '@/pages/MemberPage';
import BusPage from '@/pages/BusPage';
import RoutePage from '@/pages/RoutePage';
import StopPage from '@/pages/StopPage';
import ViolationPage from '@/pages/ViolationPage';
import MemberEdit from '@/pages/MemberEdit';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import zhCN from 'date-fns/locale/zh-CN';
import BusEdit from '@/pages/BusEdit';
import FleetDetail from '@/pages/FleetDetail';
import ViolationEdit from '@/pages/ViolationEdit';
import StatisticsPage from '@/pages/StatisticsPage';
import ViolationSearchPage from '@/pages/ViolationSearchPage';

connectDB();

registerLocale('zh-CN', zhCN);
setDefaultLocale('zh-CN');

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: '/',
        element: <AuthRequired><App /></AuthRequired>,
        children: [
          {
            index: true,
            element: <StatisticsPage />,
          },
          {
            path: 'company',
            element: <CompanyPage />,
          },
          {
            path: 'fleet',
            element: <FleetPage />,
          },
          {
            path: 'fleet/:id',
            element: <FleetDetail />,
          },
          {
            path: 'member',
            element: <MemberPage />,
          },
          {
            path: 'member/new',
            element: <MemberEdit type="new" />,
          },
          {
            path: 'member/:id',
            element: <MemberEdit type="edit" />,
          },
          {
            path: 'bus',
            element: <BusPage />,
          },
          {
            path: 'bus/new',
            element: <BusEdit type="new" />,
          },
          {
            path: 'bus/:id',
            element: <BusEdit type="edit" />,
          },
          {
            path: 'route',
            element: <RoutePage />,
          },
          {
            path: 'stop',
            element: <StopPage />,
          },
          {
            path: 'violation',
            element: <ViolationPage />,
          },
          {
            path: 'violation/new',
            element: <ViolationEdit type="new" />,
          },
          {
            path: 'violation/:id',
            element: <ViolationEdit type="edit" />,
          },
          {
            path: 'violation-search',
            element: <ViolationSearchPage />,
          }
        ],
      },
      {
        path: '*',
        element: <App />,
      },
      {
        path: '/login',
        element: <Login />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

postMessage({ payload: 'removeLoading' }, '*');
