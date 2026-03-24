import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function BlogPostCount() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPostCount = async () => {
      try {
        const now = new Date().toISOString();
        const { count, error } = await supabase
          .from('blog_posts')
          .select('*', { count: 'exact', head: true })
          .or(`status.eq.published,and(status.eq.scheduled,scheduled_publish_at.lte.${now})`);

        if (error) throw error;
        
        setCount(count);
      } catch (err) {
        console.error('Error fetching post count:', err);
        setError('Failed to load post count');
      } finally {
        setLoading(false);
      }
    };

    fetchPostCount();
  }, []);

  if (loading) return <div>Loading post count...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-medium mb-2">Blog Statistics</h3>
      <p>Total number of blog posts: <strong>{count}</strong></p>
    </div>
  );
}
