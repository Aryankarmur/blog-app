import { useNavigate } from 'react-router-dom';
import { Tag } from 'lucide-react';
import './CategoryList.css';

const CategoryList = ({ categories }) => {
  const navigate = useNavigate();

  if (!categories || categories.length === 0) return null;

  const handleCategoryClick = (category) => {
    navigate(`/explore?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="category-list-container">
      <h3 className="category-list-title">Explore by Category</h3>
      <div className="category-chips">
        {categories.map((cat) => (
          <button 
            key={cat} 
            className="category-chip" 
            onClick={() => handleCategoryClick(cat)}
          >
            <Tag size={14} className="category-icon" />
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
