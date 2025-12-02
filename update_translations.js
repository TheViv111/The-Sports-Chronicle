const url = "https://whgjiirmcbsiqhjzgldy.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoZ2ppaXJtY2JzaXFoanpnbGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjY5ODAsImV4cCI6MjA3MTk0Mjk4MH0.P4gXbWSPBX1qtfDTCQXjTA_0rcl84mAJXXRqdflpV9Y";

async function updateTranslations() {
    try {
        // Step 1: Clear all existing translations
        console.log('Clearing all existing translations...');
        const clearResponse = await fetch(`${url}/rest/v1/blog_posts`, {
            method: 'PATCH',
            headers: {
                "apikey": key,
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            },
            body: JSON.stringify({ translations: {} })
        });

        if (!clearResponse.ok) {
            throw new Error(`Clear failed: ${clearResponse.status} ${clearResponse.statusText}`);
        }
        console.log('✓ Cleared all existing translations');

        // Step 2: Add Hindi translation for Cruyff turn
        console.log('\nAdding Hindi translation for Cruyff turn...');
        const updateResponse = await fetch(`${url}/rest/v1/blog_posts?slug=eq.the-cruyff-turn-simple-but-effective`, {
            method: 'PATCH',
            headers: {
                "apikey": key,
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            },
            body: JSON.stringify({
                translations: {
                    title: {
                        hi: 'क्रूफ टर्न - सरल, लेकिन प्रभावी'
                    },
                    content: {
                        hi: '<h3><strong>क्रूफ टर्न का इतिहास</strong></h3><p>जोहान क्रूफ ने पहली बार 1974 के विश्व कप में नीदरलैंड और स्वीडन के बीच ग्रुप स्टेज मैच के दौरान इस चाल को अंजाम दिया। डिफेंडर जान ओल्सन द्वारा बारीकी से मार्क किए जाने और गोल से दूर होने के बावजूद, क्रूफ ने पास देने का नाटक किया लेकिन इसके बजाय गेंद को अपने खड़े पैर के पीछे खींच लिया, 180 डिग्री घूम गए, और जगह में तेजी से आगे बढ़ गए, अपने मार्कर को पीछे छोड़ दिया।</p><h3><strong>क्रूफ टर्न कैसे करें</strong></h3><ul><li>गेंद के पास ऐसे जाएं जैसे कि आप पास देने या शूट करने वाले हैं।</li><li>अंतिम क्षण में, गेंद को अपने खड़े पैर के पीछे खींचें।</li><li>अपने शरीर को 180 डिग्री मोड़ें।</li><li>डिफेंडर से दूर तेजी से आगे बढ़ें।</li></ul>'
                    },
                    excerpt: {
                        hi: 'क्रूफ टर्न फुटबॉल में एक प्रतिष्ठित ड्रिब्लिंग चाल है, जिसका नाम डच दिग्गज जोहान क्रूफ के नाम पर रखा गया है।'
                    },
                    category: {
                        hi: 'फुटबॉल'
                    }
                }
            })
        });

        if (!updateResponse.ok) {
            throw new Error(`Update failed: ${updateResponse.status} ${updateResponse.statusText}`);
        }
        console.log('✓ Successfully added Hindi translation for Cruyff turn!');
        console.log('\n✅ Translation update complete!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

updateTranslations();
