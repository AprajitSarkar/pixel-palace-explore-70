
import React from 'react';
import { Button } from "@/components/ui/button";
import { getPopularCategories } from '@/services/pixabayService';

interface CategoriesProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const Categories: React.FC<CategoriesProps> = ({ selectedCategory, onSelectCategory }) => {
  const categories = getPopularCategories();

  return (
    <div className="w-full overflow-x-auto py-4 scrollbar-none">
      <div className="flex space-x-2 min-w-max px-4">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          className={`rounded-full ${
            selectedCategory === null ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
          }`}
          onClick={() => onSelectCategory(null)}
        >
          All
        </Button>
        
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            className={`rounded-full ${
              selectedCategory === category 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground'
            }`}
            onClick={() => onSelectCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Categories;
