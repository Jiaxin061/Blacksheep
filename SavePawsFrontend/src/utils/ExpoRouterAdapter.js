import React, { createContext, useContext } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';

/**
 * Adapter to make expo-router components work with React Navigation
 * Provides router and params that match expo-router API
 */
export const ExpoRouterContext = createContext(null);

export const useExpoRouterAdapter = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const router = {
    push: (path, params) => {
      if (typeof path === 'string') {
        // Handle query string format: "/animal-details?id=123"
        if (path.includes('?')) {
          const [screenName, queryString] = path.split('?');
          const queryParams = {};
          queryString.split('&').forEach(param => {
            const [key, value] = param.split('=');
            queryParams[key] = value;
          });
          navigation.navigate(screenName.replace('/', ''), queryParams);
        } else {
          // Simple path: "/animal-list"
          const screenName = path.replace('/', '');
          navigation.navigate(screenName, params);
        }
      } else if (path && path.pathname) {
        // Object format: { pathname: "/animal-details", params: { id: "123" } }
        const screenName = path.pathname.replace('/', '');
        navigation.navigate(screenName, path.params);
      }
    },
    back: () => navigation.goBack(),
    replace: (path, params) => {
      if (typeof path === 'string') {
        navigation.replace(path.replace('/', ''), params);
      } else if (path && path.pathname) {
        navigation.replace(path.pathname.replace('/', ''), path.params);
      }
    },
  };

  // Convert route params to expo-router style
  const params = route.params || {};
  
  // Handle query string params (e.g., "?id=123")
  if (route.params && route.params.id) {
    params.id = route.params.id.toString();
  }

  return { router, params };
};

/**
 * Provider component that wraps screens to provide expo-router-like functionality
 */
export const ExpoRouterProvider = ({ children }) => {
  const adapter = useExpoRouterAdapter();
  return (
    <ExpoRouterContext.Provider value={adapter}>
      {children}
    </ExpoRouterContext.Provider>
  );
};

