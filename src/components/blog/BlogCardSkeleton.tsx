import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';

// Memoized skeleton to prevent unnecessary re-renders
const BlogCardSkeleton: React.FC = memo(() => {
  return (
    <Card
      className="overflow-hidden h-full flex flex-col"
      style={{ contain: 'layout style' }}
    >
      {/* Match exact BlogCard image container dimensions */}
      <div
        className="bg-muted animate-pulse"
        style={{
          aspectRatio: '16/9',
          contain: 'strict',
        }}
      />

      <CardHeader className="pb-2">
        {/* Title skeleton */}
        <div className="h-6 bg-muted rounded w-3/4 animate-pulse mb-2" />
        {/* Date and read time */}
        <div className="flex items-center gap-2">
          <div className="h-4 bg-muted rounded w-20 animate-pulse" />
          <span className="text-muted-foreground">•</span>
          <div className="h-4 bg-muted rounded w-16 animate-pulse" />
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-2">
        {/* Excerpt skeleton - 3 lines */}
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full animate-pulse" />
          <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-muted rounded w-4/6 animate-pulse" />
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-2">
        {/* Badge skeleton */}
        <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
        {/* Arrow */}
        <div className="h-4 w-4 bg-muted rounded animate-pulse" />
      </CardFooter>
    </Card>
  );
});

BlogCardSkeleton.displayName = 'BlogCardSkeleton';

export default BlogCardSkeleton;