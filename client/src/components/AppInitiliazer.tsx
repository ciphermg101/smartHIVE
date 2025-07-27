import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { attachAuthInterceptor } from '@lib/axios';

const AppInitializer = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    attachAuthInterceptor(getToken);
  }, [getToken]);

  return null;
};

export default AppInitializer;
