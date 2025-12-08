// Offline mock data to remove API dependency
const mockAnimals = [
  { id: 1, name: 'Bella', species: 'Dog', breed: 'Labrador', age: 3, status: 'available', gender: 'female' },
  { id: 2, name: 'Max', species: 'Dog', breed: 'Mixed', age: 2, status: 'adopted', gender: 'male' },
  { id: 3, name: 'Luna', species: 'Cat', breed: 'Tabby', age: 1, status: 'available', gender: 'female' },
  { id: 4, name: 'Charlie', species: 'Cat', breed: 'Siamese', age: 4, status: 'fostered', gender: 'male' },
];

let animalsStore = [...mockAnimals];

export const animalService = {
  // UC05: Get all animal records (offline)
  getAllAnimals: async () => ({
    success: true,
    data: animalsStore,
  }),

  // UC05: Get single animal by ID (offline)
  getAnimalById: async (id) => {
    const found = animalsStore.find((a) => a.id === Number(id));
    return found
      ? { success: true, data: found }
      : { success: false, message: 'Animal not found' };
  },

  // UC06: Search and filter animals (offline)
  searchAnimals: async (filters = {}) => {
    const keyword = (filters.keyword || '').toLowerCase();
    const species = (filters.species || '').toLowerCase();
    const status = (filters.status || '').toLowerCase();
    const gender = (filters.gender || '').toLowerCase();
    const minAge = filters.minAge ? Number(filters.minAge) : null;
    const maxAge = filters.maxAge ? Number(filters.maxAge) : null;

    const filtered = animalsStore.filter((animal) => {
      const matchesKeyword =
        !keyword ||
        animal.name.toLowerCase().includes(keyword) ||
        (animal.breed || '').toLowerCase().includes(keyword);
      const matchesSpecies = !species || animal.species.toLowerCase() === species;
      const matchesStatus = !status || animal.status.toLowerCase() === status;
      const matchesGender = !gender || animal.gender?.toLowerCase() === gender;
      const matchesMinAge = minAge === null || (animal.age ?? 0) >= minAge;
      const matchesMaxAge = maxAge === null || (animal.age ?? 0) <= maxAge;

      return matchesKeyword && matchesSpecies && matchesStatus && matchesGender && matchesMinAge && matchesMaxAge;
    });

    return { success: true, data: filtered };
  },

  // UC07: Create new animal (offline mock)
  createAnimal: async (animalData) => {
    const nextId = Math.max(...animalsStore.map((a) => a.id), 0) + 1;
    const newAnimal = { id: nextId, status: 'available', ...animalData };
    animalsStore = [...animalsStore, newAnimal];
    return { success: true, data: newAnimal };
  },

  // UC07: Update animal (offline mock)
  updateAnimal: async (id, animalData) => {
    const idx = animalsStore.findIndex((a) => a.id === Number(id));
    if (idx === -1) return { success: false, message: 'Animal not found' };
    const updated = { ...animalsStore[idx], ...animalData };
    animalsStore[idx] = updated;
    return { success: true, data: updated };
  },

  // UC07: Delete animal (offline mock)
  deleteAnimal: async (id) => {
    const idx = animalsStore.findIndex((a) => a.id === Number(id));
    if (idx === -1) return { success: false, message: 'Animal not found' };
    animalsStore = animalsStore.filter((a) => a.id !== Number(id));
    return { success: true, data: true };
  },
};

export default animalService;



