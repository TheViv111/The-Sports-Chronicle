# Script to add footer.description to all language files

$translations = @{
    "en" = "Your ultimate destination for sports skills, techniques, and tactical analysis. Master the game with expert insights on football, basketball, and more."
    "es" = "Tu destino definitivo para habilidades deportivas, técnicas y análisis táctico. Domina el juego con conocimientos expertos sobre fútbol, baloncesto y más."
    "fr" = "Votre destination ultime pour les compétences sportives, les techniques et l'analyse tactique. Maîtrisez le jeu avec des connaissances expertes sur le football, le basketball et plus encore."
    "de" = "Ihr ultimatives Ziel für sportliche Fähigkeiten, Techniken und taktische Analysen. Meistern Sie das Spiel mit Experteneinblicken zu Fußball, Basketball und mehr."
    "it" = "La vostra destinazione definitiva per abilità sportive, tecniche e analisi tattica. Padroneggia il gioco con approfondimenti esperti su calcio, basket e altro ancora."
    "pt" = "Seu destino definitivo para habilidades esportivas, técnicas e análise tática. Domine o jogo com insights especializados sobre futebol, basquete e mais."
    "ru" = "Ваше главное направление для спортивных навыков, техник и тактического анализа. Овладейте игрой с экспертными знаниями о футболе, баскетболе и многом другом."
    "pl" = "Twoje ostateczne miejsce docelowe dla umiejętności sportowych, technik i analizy taktycznej. Opanuj grę dzięki fachowym spostrzeżeniom na temat piłki nożnej, koszykówki i nie tylko."
    "nl" = "Jouw ultieme bestemming voor sportvaardigheden, technieken en tactische analyse. Beheers het spel met deskundige inzichten over voetbal, basketbal en meer."
    "sv" = "Din ultimata destination för sportfärdigheter, tekniker och taktisk analys. Bemästra spelet med expertinsikter om fotboll, basket och mer."
    "no" = "Din ultimate destinasjon for sportferdigheter, teknikker og taktisk analyse. Mestre spillet med ekspertinnsikt om fotball, basketball og mer."
    "da" = "Din ultimative destination for sportsfærdigheder, teknikker og taktisk analyse. Mestre spillet med ekspertindsigt om fodbold, basketball og mere."
    "fi" = "Lopullinen kohteesi urheilutaidoille, tekniikoille ja taktiselle analyysille. Hallitse peli asiantuntijanäkemyksillä jalkapallosta, koripallosta ja muusta."
    "zh" = "您获取体育技能、技术和战术分析的终极目的地。通过足球、篮球等方面的专家见解掌握比赛。"
    "ja" = "スポーツのスキル、テクニック、戦術分析のための究極の目的地。サッカー、バスケットボールなどに関する専門家の洞察でゲームをマスターしましょう。"
    "ko" = "스포츠 기술, 기법 및 전술 분석을 위한 궁극적인 목적지입니다. 축구, 농구 등에 대한 전문가 통찰력으로 게임을 마스터하세요."
    "hi" = "खेल कौशल, तकनीक और रणनीतिक विश्लेषण के लिए आपका अंतिम गंतव्य। फुटबॉल, बास्केटबॉल और अधिक पर विशेषज्ञ अंतर्दृष्टि के साथ खेल में महारत हासिल करें।"
    "bn" = "খেলাধুলার দক্ষতা, কৌশল এবং কৌশলগত বিশ্লেষণের জন্য আপনার চূড়ান্ত গন্তব্য। ফুটবল, বাস্কেটবল এবং আরও অনেক কিছুতে বিশেষজ্ঞ অন্তর্দৃষ্টি দিয়ে খেলায় দক্ষতা অর্জন করুন।"
    "ta" = "விளையாட்டு திறன்கள், நுட்பங்கள் மற்றும் தந்திரோபாய பகுப்பாய்வுக்கான உங்கள் இறுதி இலக்கு। கால்பந்து, கூடைப்பந்து மற்றும் பலவற்றில் நிபுணர் நுண்ணறிவுகளுடன் விளையாட்டில் தேர்ச்சி பெறுங்கள்।"
    "te" = "క్రీడా నైపుణ్యాలు, పద్ధతులు మరియు వ్యూహాత్మక విశ్లేషణ కోసం మీ అంతిమ గమ్యం। ఫుట్‌బాల్, బాస్కెట్‌బాల్ మరియు మరిన్నింటిపై నిపుణుల అంతర్దృష్టులతో ఆటలో నైపుణ్యం సాధించండి।"
    "mr" = "क्रीडा कौशल्ये, तंत्रे आणि रणनीतिक विश्लेषणासाठी तुमचे अंतिम गंतव्य। फुटबॉल, बास्केटबॉल आणि अधिकवर तज्ञ अंतर्दृष्टीसह खेळात प्रभुत्व मिळवा।"
    "gu" = "રમતગમત કૌશલ્યો, તકનીકો અને વ્યૂહાત્મક વિશ્લેષણ માટે તમારું અંતિમ ગંતવ્ય. ફૂટબોલ, બાસ્કેટબોલ અને વધુ પર નિષ્ણાત આંતરદૃષ્ટિ સાથે રમતમાં નિપુણતા મેળવો।"
    "ar" = "وجهتكم النهائية لمهارات الرياضة والتقنيات والتحليل التكتيكي. أتقن اللعبة مع رؤى الخبراء حول كرة القدم وكرة السلة والمزيد."
    "he" = "היעד האולטימטיבי שלכם לכישורי ספורט, טכניקות וניתוח טקטי. שלטו במשחק עם תובנות מומחים על כדורגל, כדורסל ועוד."
    "fa" = "مقصد نهایی شما برای مهارت‌های ورزشی، تکنیک‌ها و تحلیل تاکتیکی. با بینش‌های متخصص در مورد فوتبال، بسکتبال و موارد دیگر، بازی را تسلط یابید."
    "tr" = "Spor becerileri, teknikler ve taktik analiz için nihai hedefiniz. Futbol, basketbol ve daha fazlası hakkında uzman görüşleriyle oyunda ustalaşın."
    "th" = "จุดหมายปลายทางสูงสุดของคุณสำหรับทักษะกีฬา เทคนิค และการวิเคราะห์เชิงกลยุทธ์ เชี่ยวชาญเกมด้วยข้อมูลเชิงลึกจากผู้เชี่ยวชาญเกี่ยวกับฟุตบอล บาสเกตบอล และอื่นๆ"
}

$translationsPath = "src\data\translations"

foreach ($lang in $translations.Keys) {
    $filePath = "$translationsPath\$lang.json"
    
    if (Test-Path $filePath) {
        Write-Host "Processing $lang.json..." -ForegroundColor Cyan
        
        # Read the file
        $content = Get-Content $filePath -Raw
        
        # Parse JSON
        $json = $content | ConvertFrom-Json
        
        # Add the footer.description key
        $json | Add-Member -MemberType NoteProperty -Name "footer.description" -Value $translations[$lang] -Force
        
        # Convert back to JSON with proper formatting
        $newContent = $json | ConvertTo-Json -Depth 10
        
        # Write back to file
        $newContent | Set-Content $filePath -Encoding UTF8
        
        Write-Host "✓ Added footer.description to $lang.json" -ForegroundColor Green
    }
    else {
        Write-Host "✗ File not found: $filePath" -ForegroundColor Red
    }
}

Write-Host "`n✨ Done! Added footer.description to all language files." -ForegroundColor Green
