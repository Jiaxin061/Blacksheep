import React from 'react';

// Import the actual TypeScript component directly
// Metro config will alias expo-router to our mock
const AnimalListComponent = require('../app/animal-list').default;

/**
 * Wrapper screen that uses the existing TypeScript component
 * The mockExpoRouter.js will handle expo-router hooks
 */
const AnimalListScreen = (props) => {
  return <AnimalListComponent {...props} />;
};

export default AnimalListScreen;
