import { useNavigation, useRoute } from '@react-navigation/native';

/**
 * Replacement for expo-router's useRouter hook
 * Converts React Navigation to expo-router-style API
 */
export const useRouter = () => {
  const navigation = useNavigation();

  return {
    push: (path, params) => {
      if (typeof path === 'string') {
        // Handle query string format: "/animal-details?id=123"
        if (path.includes('?')) {
          const [screenName, queryString] = path.split('?');
          const queryParams = {};
          queryString.split('&').forEach(param => {
            const [key, value] = param.split('=');
            queryParams[key] = decodeURIComponent(value);
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
};

/**
 * Replacement for expo-router's useLocalSearchParams hook
 * Gets params from React Navigation route
 */
export const useLocalSearchParams = () => {
  const route = useRoute();
  return route.params || {};
};

