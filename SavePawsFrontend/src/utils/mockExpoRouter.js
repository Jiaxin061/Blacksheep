import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';

/**
 * Mock expo-router module
 * Provides hooks that match expo-router API but use React Navigation underneath
 */

// Path mapping from expo-router paths to React Navigation screen names
const pathToScreenMap = {
  '/': 'UserHome',
  '/animal-list': 'AnimalList',
  '/animal-details': 'AnimalDetails',
  '/donation-impact': 'DonationImpact',
  '/rewards/catalogue': 'RewardsCatalogue',
  '/admin/dashboard': 'AdminDonationDashboard',
  '/admin/animals': 'AdminAnimals',
  '/admin/fund-allocation': 'AdminFundAllocation',
  '/admin/rewards': 'AdminRewards',
  // Dynamic routes - these will be handled by extracting the base path
  '/admin/add-animal': 'AdminAddAnimal',
  '/admin/edit-animal': 'AdminEditAnimal',
  '/rewards/history': 'RewardsHistory',
  '/rewards/voucher': 'RewardsVoucher',
  '/rewards/[rewardID]': 'RewardDetail',
  '/donation-impact/[animalID]': 'DonationImpactDetail',
  '/donation-impact/receipt/[transactionID]': 'DonationReceipt',
  '/admin/rewards/add': 'AdminRewardsAdd',
  '/admin/rewards/edit/[rewardID]': 'AdminRewardsEdit',
  '/admin/fund-allocation/[animalID]': 'AdminFundAllocationDetail',
  '/admin/fund-allocation/[animalID]/add': 'AdminFundAllocationAdd',
  '/admin/fund-allocation/[animalID]/[allocationID]': 'AdminFundAllocationItem',
};

/**
 * Convert expo-router path to React Navigation screen name
 */
const getScreenName = (path) => {
  if (typeof path === 'string') {
    // Remove query string if present
    const basePath = path.split('?')[0];
    // Check exact match first
    if (pathToScreenMap[basePath]) {
      return pathToScreenMap[basePath];
    }
    // Check dynamic routes (e.g., /donation-impact/123 -> /donation-impact/[animalID])
    for (const [routePath, screenName] of Object.entries(pathToScreenMap)) {
      if (routePath.includes('[')) {
        // Convert route pattern to regex (e.g., /donation-impact/[animalID] -> /donation-impact/.+)
        const routePattern = routePath.replace(/\[.*?\]/g, '[^/]+');
        const regex = new RegExp(`^${routePattern.replace(/\//g, '\\/')}$`);
        if (regex.test(basePath)) {
          return screenName;
        }
      }
    }
    // Fallback: convert kebab-case path to PascalCase screen name
    // e.g., "/animal-list" -> "AnimalList", "/rewards/catalogue" -> "RewardsCatalogue"
    return basePath
      .replace(/^\//, '')
      .split('/')
      .map(part => {
        // Remove dynamic segments like [animalID]
        const cleanPart = part.replace(/\[.*?\]/g, '');
        return cleanPart
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');
      })
      .filter(part => part.length > 0)
      .join('');
  } else if (path && path.pathname) {
    return getScreenName(path.pathname);
  }
  return null;
};

// Export useRouter hook
export const useRouter = () => {
  const navigation = useNavigation();

  return {
    push: (path, params) => {
      const screenName = getScreenName(path);
      if (screenName) {
        // Merge params from path object and additional params
        const finalParams = typeof path === 'object' && path.params 
          ? { ...path.params, ...params }
          : params || {};
        
        // Extract dynamic route params from path string (e.g., /donation-impact/123 -> { animalID: '123' })
        if (typeof path === 'string' && path.includes('/')) {
          const pathParts = path.split('/').filter(p => p && !p.includes('?'));
          const dynamicParams = {};
          
          // Try to match against dynamic routes
          for (const [routePath, screen] of Object.entries(pathToScreenMap)) {
            if (routePath.includes('[')) {
              const routeParts = routePath.split('/').filter(p => p);
              const paramNames = routeParts.map(p => {
                const match = p.match(/\[(.*?)\]/);
                return match ? match[1] : null;
              });
              
              if (pathParts.length === routeParts.length) {
                routeParts.forEach((part, idx) => {
                  if (part.includes('[') && paramNames[idx]) {
                    dynamicParams[paramNames[idx]] = pathParts[idx];
                  }
                });
                if (Object.keys(dynamicParams).length > 0) {
                  Object.assign(finalParams, dynamicParams);
                }
              }
            }
          }
        }
        
        navigation.navigate(screenName, finalParams);
      } else {
        console.warn('Could not resolve screen name for path:', path);
      }
    },
    back: () => navigation.goBack(),
    replace: (path, params) => {
      const screenName = getScreenName(path);
      if (screenName) {
        const finalParams = typeof path === 'object' && path.params 
          ? { ...path.params, ...params }
          : params || {};
        navigation.replace(screenName, finalParams);
      } else {
        console.warn('Could not resolve screen name for path:', path);
      }
    },
  };
};

// Export useLocalSearchParams hook
export const useLocalSearchParams = () => {
  const route = useRoute();
  return route.params || {};
};

// Export useFocusEffect hook (from React Navigation)
export { useFocusEffect };

// Export Stack component (just a pass-through for React Navigation)
export const Stack = ({ children, ...props }) => {
  return children;
};

// Export Stack.Screen component (used in some TypeScript files)
Stack.Screen = ({ options, ...props }) => {
  // This is a no-op in React Navigation - screen options are set in AppNavigator
  return null;
};

// Export router object (for direct usage)
export const router = {
  push: (path, params) => {
    // This won't work without navigation context, but provides the API
    console.warn('router.push called outside navigation context');
  },
  back: () => {
    console.warn('router.back called outside navigation context');
  },
};

