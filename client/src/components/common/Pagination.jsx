import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, hasNextPage, hasPreviousPage, onPageChange }) => {
  return (
    <nav className="pagination-container" aria-label="Pagination Navigation">
      <button 
        className="pagination-btn" 
        disabled={!hasPreviousPage} 
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={20} />
        <span className="pagination-text">Previous</span>
      </button>
      
      <div className="pagination-info">
        <span className="pagination-current">Page {currentPage}</span>
        <span className="pagination-total">of {totalPages}</span>
      </div>

      <button 
        className="pagination-btn" 
        disabled={!hasNextPage} 
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        <span className="pagination-text">Next</span>
        <ChevronRight size={20} />
      </button>
    </nav>
  );
};

export default Pagination;
