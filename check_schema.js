const url = "https://whgjiirmcbsiqhjzgldy.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoZ2ppaXJtY2JzaXFoanpnbGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjY5ODAsImV4cCI6MjA3MTk0Mjk4MH0.P4gXbWSPBX1qtfDTCQXjTA_0rcl84mAJXXRqdflpV9Y";

async function checkSchema() {
    try {
        // Fetch one blog post to see its structure
        const response = await fetch(`${url}/rest/v1/blog_posts?limit=1`, {
            headers: {
                "apikey": key,
                "Authorization": `Bearer ${key}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.length > 0) {
            console.log('Current blog_posts columns:');
            console.log(Object.keys(data[0]).join(', '));
            console.log('\nHas translations column?', 'translations' in data[0]);

            if ('translations' in data[0]) {
                console.log('\nTranslations value:', JSON.stringify(data[0].translations, null, 2));
            }
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

checkSchema();
