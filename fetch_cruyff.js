const url = "https://whgjiirmcbsiqhjzgldy.supabase.co/rest/v1/blog_posts?id=eq.fd090043-43a6-44aa-9277-1430d4ab20b7&select=title,content,excerpt,category,slug";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoZ2ppaXJtY2JzaXFoanpnbGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjY5ODAsImV4cCI6MjA3MTk0Mjk4MH0.P4gXbWSPBX1qtfDTCQXjTA_0rcl84mAJXXRqdflpV9Y";

async function fetchArticle() {
    try {
        const response = await fetch(url, {
            headers: {
                "apikey": key,
                "Authorization": `Bearer ${key}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error fetching article:", error);
    }
}

fetchArticle();
