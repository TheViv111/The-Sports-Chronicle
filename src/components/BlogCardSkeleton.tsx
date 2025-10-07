import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const BlogCardSkeleton: React.FC = () => {
  return (
    <Card className="overflow-hidden h-full animate-pulse">
      <div className="aspect-[21/9] bg-muted"></div>
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
          </div>
          <div className="h-5 bg-muted rounded w-1/4 mb-3"></div> {/* Category Badge */}
          <div className="h-6 bg-muted rounded w-3/4 mb-3"></div> {/* Title */}
          <div className="h-4 bg-muted rounded w-full mb-2"></div> {/* Excerpt line 1 */}
          <div className="h-4 bg-muted rounded w-5/6 mb-4"></div> {/* Excerpt line 2 */}
        </div>
        <div className="h-4 bg-muted rounded w-1/3 self-start"></div> {/* Read article link */}
      </CardContent>
    </Card>
  );
};

export default BlogCardSkeleton;