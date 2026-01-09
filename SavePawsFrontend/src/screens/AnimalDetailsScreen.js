import React from 'react';

// Import the actual TypeScript component directly
// Metro config will alias expo-router to our mock
const AnimalDetailsComponent = require('../app/animal-details').default;

/**
 * Wrapper screen that uses the existing TypeScript component
 * The mockExpoRouter.js will handle expo-router hooks
 */
const AnimalDetailsScreen = (props) => {
  return <AnimalDetailsComponent {...props} />;
};

export default AnimalDetailsScreen;

