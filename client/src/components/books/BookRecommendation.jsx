import PropTypes from 'prop-types';

export default function BookRecommendation({ books }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Book Recommendation
        </h2>
        <button className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
          View all →
        </button>
      </div>
      
      <div className="flex space-x-6 overflow-x-auto pb-4">
        {books.map((book) => (
          <div
            key={book.id}
            className="flex-none w-48"
          >
            <div className="aspect-w-3 aspect-h-4 rounded-lg overflow-hidden shadow-lg">
              <img
                src={book.coverUrl}
                alt={book.title}
                className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-200"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

BookRecommendation.propTypes = {
  books: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      coverUrl: PropTypes.string.isRequired,
    })
  ).isRequired,
}; 