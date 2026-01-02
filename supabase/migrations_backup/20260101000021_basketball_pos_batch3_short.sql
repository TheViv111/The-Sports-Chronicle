UPDATE blog_posts
SET translations = translations || $json$ {
  "ar": {
    "title": "مراكز كرة السلة وأدوارها: دليل كامل",
    "category": "كرة السلة",
    "excerpt": "كرة السلة هي رياضة سريعة وإستراتيجية حيث لكل لاعب دور فريد.",
    "content": "<h4>1. صانع الألعاب (PG)</h4><p>مسؤول عن تسيير هجوم الفريق.</p><h4>2. مدافع التصويب (SG)</h4><p>عادة ما يكون أفضل هداف للفريق من الخارج.</p><h4>3. لاعب الارتكاز الصغير (SF)</h4><p>اللاعب الأكثر تنوعا.</p><h4>4. لاعب الارتكاز القوي (PF)</h4><p>يلعب بالقرب من السلة.</p><h4>5. لاعب الارتكاز (C)</h4><p>المرتكز الدفاعي.</p>"
  },
  "he": {
    "title": "עמדות כדורסל ותפקידיהן: מדריך מלא",
    "category": "כדורסל",
    "excerpt": "כדורסל הוא ספורט מהיר ואסטרטגי שבו לכל שחקן יש תפקיד ייחודי.",
    "content": "<h4>1. רכז (PG)</h4><p>אחראי על ניהול התקפת הקבוצה.</p><h4>2. קלע (SG)</h4><p>בדרך כלל הקלעי הטוב ביותר בקבוצה מחוץ לקשת.</p><h4>3. סמול פורוורד (SF)</h4><p>השחקן המגוון ביותר.</p><h4>4. פאוור פורוורד (PF)</h4><p>משחק קרוב לסל.</p><h4>5. סנטר (C)</h4><p>עוגן הגנתי.</p>"
  },
  "fa": {
    "title": "موقعیت‌های بسکتبال و نقش‌های آن‌ها: راهنمای کامل",
    "category": "بسکتبال",
    "excerpt": "بسکتبال ورزشی سریع و استراتژیک است که در آن هر بازیکن نقش منحصر به فردی دارد.",
    "content": "<h4>1. پوینت گارد (PG)</h4><p>مسئول اجرای حمله تیم.</p><h4>2. شوتینگ گارد (SG)</h4><p>معمولاً بهترین گلزن تیم از بیرون.</p><h4>3. اسمال فوروارد (SF)</h4><p>همه کاره‌ترین بازیکن.</p><h4>4. پاور فوروارد (PF)</h4><p>نزدیک سبد بازی می‌کند.</p><h4>5. سنتر (C)</h4><p>لنگر دفاعی.</p>"
  },
  "tr": {
    "title": "Basketbol Pozisyonları ve Rolleri: Tam Bir Kılavuz",
    "category": "Basketbol",
    "excerpt": "Basketbol, her oyuncunun takımın başarısına katkıda bulunan benzersiz bir role sahip olduğu hızlı tempolu ve stratejik bir spordur.",
    "content": "<h4>1. Oyun Kurucu (PG)</h4><p>Takımın hücumunu yönetmekten sorumludur.</p><h4>2. Şutör Gard (SG)</h4><p>Genellikle takımın dışarıdan en iyi skoreri.</p><h4>3. Kısa Forvet (SF)</h4><p>En çok yönlü oyuncu.</p><h4>4. Uzun Forvet (PF)</h4><p>Potaya yakın oynar.</p><h4>5. Pivot (C)</h4><p>Savunma çapası.</p>"
  }
} $json$::jsonb
WHERE slug = 'basketball-positions-and-their-roles-a-complete-guide';
