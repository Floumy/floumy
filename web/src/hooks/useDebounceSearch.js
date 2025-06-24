import { useCallback, useRef, useState } from 'react';

function useDebounceSearch(onSearch, delay = 500) {
  const [searchText, setSearchText] = useState('');
  const typingTimeoutRef = useRef(null);

  const debounce = useCallback(
    (func) => {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(func, delay);
    },
    [delay],
  );

  const handleSearch = useCallback(
    (event) => {
      const newSearchText = event.target.value;
      setSearchText(newSearchText);
      if (onSearch) {
        debounce(() => onSearch(newSearchText));
      }
    },
    [onSearch, debounce],
  );

  return [searchText, handleSearch];
}

export default useDebounceSearch;
