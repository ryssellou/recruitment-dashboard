import { createContext, useContext, useState } from 'react';

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState({
    role: '',
    search: '',
    reviewedByMe: null, // null = all, true = reviewed, false = not reviewed
    consensus: ''
  });

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      role: '',
      search: '',
      reviewedByMe: null,
      consensus: ''
    });
  };

  return (
    <FilterContext.Provider value={{ filters, updateFilter, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}

export default FilterContext;
