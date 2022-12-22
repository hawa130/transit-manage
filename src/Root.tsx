import { ChakraProvider } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@/utils/Auth';

function Root() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </ChakraProvider>
  );
}

export default Root;
