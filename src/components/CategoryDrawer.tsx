
import React from 'react';
import { X, Video, Image, Music, Film } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getPopularCategories } from '@/services/pixabayService';

interface CategoryDrawerProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const CategoryDrawer: React.FC<CategoryDrawerProps> = ({ selectedCategory, onSelectCategory }) => {
  const categories = getPopularCategories();
  
  // Category type icons
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'nature':
      case 'backgrounds':
      case 'travel':
        return <Image className="h-5 w-5" />;
      case 'music':
        return <Music className="h-5 w-5" />;
      case 'animation':
      case 'anime':
        return <Film className="h-5 w-5" />;
      default:
        return <Video className="h-5 w-5" />;
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full">
          Categories
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Explore Categories</SheetTitle>
        </SheetHeader>
        <div className="py-4">
          <div className="space-y-1">
            <Button
              variant={selectedCategory === null ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => onSelectCategory(null)}
            >
              <Video className="mr-2 h-5 w-5" />
              All Videos
            </Button>
            
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onSelectCategory(category)}
              >
                {getCategoryIcon(category)}
                <span className="ml-2 capitalize">{category}</span>
              </Button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CategoryDrawer;
