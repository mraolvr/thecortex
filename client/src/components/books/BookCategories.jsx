import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export default function BookCategories({ categories }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Book Category
        </h2>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 6h16M4 12h16m-7 6h7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/books/category/${category.id}`}
            className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 hover:shadow-lg transition-shadow"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <img
              src={category.imageUrl}
              alt={category.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-medium text-sm">
                {category.name}
              </h3>
              <p className="text-gray-200 text-xs mt-1">
                {category.bookCount} books
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

BookCategories.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      imageUrl: PropTypes.string.isRequired,
      bookCount: PropTypes.number.isRequired,
    })
  ).isRequired,
}; 