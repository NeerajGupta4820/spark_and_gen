import React from 'react';

// Pagination component for Dashboard
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Helper to create page numbers
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center gap-2 mt-8 py-8">
      <button
        className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 disabled:opacity-50"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      {pages.map((page) => (
        <button
          key={page}
          className={`px-3 py-1 rounded transition font-semibold ${
            page === currentPage
              ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100'
          }`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      <button
        className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 disabled:opacity-50"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
      <span className="ml-4 text-gray-600 dark:text-gray-300">Page {currentPage} of {totalPages}</span>
    </div>
  );
};

export default Pagination;
