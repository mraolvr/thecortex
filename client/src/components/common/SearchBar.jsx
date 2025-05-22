import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Mock suggestions - in real app, this would come from an API
  const getSuggestions = (value) => {
    const suggestions = [
      { type: 'task', title: 'Create project plan', path: '/work' },
      { type: 'book', title: 'Deep Work', path: '/books' },
      { type: 'note', title: 'Meeting notes', path: '/creative' },
      { type: 'document', title: 'Q4 Report', path: '/media' },
    ];

    return suggestions.filter(item =>
      item.title.toLowerCase().includes(value.toLowerCase())
    );
  };

  const suggestions = query ? getSuggestions(query) : [];

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement global search logic here
    console.log('Searching for:', query);
    setIsOpen(false);
  };

  const handleSuggestionClick = (suggestion) => {
    navigate(suggestion.path);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="w-full h-10 pl-10 pr-4 py-2 rounded-search
                     bg-background-light dark:bg-gray-800
                     text-text-primary dark:text-gray-200
                     placeholder-neutral focus:outline-none
                     focus:ring-2 focus:ring-primary-light"
            placeholder="Search anything..."
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-neutral"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </form>

      {/* Search suggestions */}
      {isOpen && query && (
        <div
          className="absolute mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg z-50"
          onMouseDown={(e) => e.preventDefault()}
        >
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li key={index}>
                <button
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-primary-pale dark:hover:bg-gray-700"
                >
                  <div className="flex items-center">
                    <span className="text-sm text-neutral capitalize mr-2">
                      {suggestion.type}:
                    </span>
                    <span className="text-text-primary dark:text-gray-200">
                      {suggestion.title}
                    </span>
                  </div>
                </button>
              </li>
            ))}
            {suggestions.length === 0 && (
              <li className="px-4 py-2 text-sm text-neutral">
                No results found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchBar; 