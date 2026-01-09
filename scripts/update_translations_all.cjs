const fs = require('fs');
const path = require('path');

const translationsDir = path.join(__dirname, '../src/data/translations');

const newContent = {
    // English (already done, but including for completeness/consistency logic)
    en: {
        "about.missionText": "We strive to be the premier source for in-depth tactical and technical sports analysis. Our goal is to deconstruct complex plays and techniques, helping enthusiasts understand the strategic depth of the game.",
        "about.footballCoverage": "Football - Tactical formation analysis, technical skill breakdowns, and strategic game studies.",
        "about.basketballCoverage": "Basketball - Offensive and defensive schematics, player technique analysis, and detailed playbook breakdowns.",
        "about.valuesText": "Precision, depth, and educational value drive everything we do. We believe in going beyond the scoreline to understand the 'how' and 'why' behind every play.",
        "about.foundationText": "Founded with a passion for understanding the game deeply, The Sports Chronicle brings you in-depth tactical analysis and expert technical insights. Our mission is to help athletes, coaches, and enthusiasts understand the strategic nuances and skills that define success in competitive sports."
    },
    // Spanish
    es: {
        "about.missionText": "Nos esforzamos por ser la fuente principal de análisis deportivos tácticos y técnicos en profundidad. Nuestro objetivo es deconstruir jugadas y técnicas complejas, ayudando a los entusiastas a comprender la profundidad estratégica del juego.",
        "about.footballCoverage": "Fútbol - Análisis de formaciones tácticas, desglose de habilidades técnicas y estudios estratégicos del juego.",
        "about.basketballCoverage": "Baloncesto - Esquemas ofensivos y defensivos, análisis de la técnica del jugador y desgloses detallados de jugadas.",
        "about.valuesText": "La precisión, la profundidad y el valor educativo impulsan todo lo que hacemos. Creemos en ir más allá del marcador para entender el 'cómo' y el 'por qué' detrás de cada jugada.",
        "about.foundationText": "Fundada con la pasión de comprender el juego profundamente, The Sports Chronicle le brinda un análisis táctico en profundidad y conocimientos técnicos expertos. Nuestra misión es ayudar a los atletas, entrenadores y entusiastas a comprender los matices estratégicos y las habilidades que definen el éxito en los deportes competitivos."
    },
    // French
    fr: {
        "about.missionText": "Nous nous efforçons d'être la première source d'analyses sportives tactiques et techniques approfondies. Notre objectif est de déconstruire les jeux et techniques complexes, aidant les passionnés à comprendre la profondeur stratégique du jeu.",
        "about.footballCoverage": "Football - Analyse des formations tactiques, décomposition des compétences techniques et études stratégiques de jeu.",
        "about.basketballCoverage": "Basketball - Schémas offensifs et défensifs, analyse de la technique des joueurs et décomposition détaillée des stratégies.",
        "about.valuesText": "La précision, la profondeur et la valeur éducative guident tout ce que nous faisons. Nous croyons qu'il faut aller au-delà du score pour comprendre le 'comment' et le 'pourquoi' derrière chaque action.",
        "about.foundationText": "Fondé avec une passion pour la compréhension profonde du jeu, The Sports Chronicle vous apporte une analyse tactique approfondie et des perspectives techniques d'experts. Notre mission est d'aider les athlètes, les entraîneurs et les passionnés à comprendre les nuances stratégiques et les compétences qui définissent le succès dans les sports de compétition."
    },
    // German
    de: {
        "about.missionText": "Wir streben danach, die führende Quelle für tiefgehende taktische und technische Sportanalysen zu sein. Unser Ziel ist es, komplexe Spielzüge und Techniken zu dekonstruieren und Enthusiasten dabei zu helfen, die strategische Tiefe des Spiels zu verstehen.",
        "about.footballCoverage": "Fußball - Analyse taktischer Formationen, Aufschlüsselung technischer Fähigkeiten und strategische Spielstudien.",
        "about.basketballCoverage": "Basketball - Offensiv- und Defensivschemata, Analyse der Spielertechnik und detaillierte Spielzuganalysen.",
        "about.valuesText": "Präzision, Tiefe und pädagogischer Wert treiben alles an, was wir tun. Wir glauben daran, über den Spielstand hinauszugehen, um das 'Wie' und 'Warum' hinter jedem Spielzug zu verstehen.",
        "about.foundationText": "Gegründet aus der Leidenschaft, das Spiel tiefgehend zu verstehen, bietet Ihnen The Sports Chronicle tiefgehende taktische Analysen und technische Experteneinblicke. Unsere Mission ist es, Athleten, Trainern und Enthusiasten zu helfen, die strategischen Nuancen und Fähigkeiten zu verstehen, die den Erfolg im Leistungssport definieren."
    },
    // Italian
    it: {
        "about.missionText": "Ci impegniamo ad essere la fonte principale per analisi sportive tattiche e tecniche approfondite. Il nostro obiettivo è decostruire giocate e tecniche complesse, aiutando gli appassionati a comprendere la profondità strategica del gioco.",
        "about.footballCoverage": "Calcio - Analisi delle formazioni tattiche, scomposizione delle abilità tecniche e studi strategici di gioco.",
        "about.basketballCoverage": "Pallacanestro - Schemi offensivi e difensivi, analisi della tecnica dei giocatori e scomposizione dettagliata degli schemi di gioco.",
        "about.valuesText": "Precisione, profondità e valore educativo guidano tutto ciò che facciamo. Crediamo nell'andare oltre il punteggio per capire il 'come' e il 'perché' dietro ogni azione.",
        "about.foundationText": "Fondato con la passione di comprendere il gioco in profondità, The Sports Chronicle ti offre analisi tattiche approfondite e approfondimenti tecnici esperti. La nostra missione è aiutare atleti, allenatori e appassionati a comprendere le sfumature strategiche e le abilità che definiscono il successo negli sport competitivi."
    },
    // Portuguese
    pt: {
        "about.missionText": "Nós nos esforçamos para ser a principal fonte de análises esportivas táticas e técnicas aprofundadas. Nosso objetivo é desconstruir jogadas e técnicas complexas, ajudando os entusiastas a entender a profundidade estratégica do jogo.",
        "about.footballCoverage": "Futebol - Análise de formações táticas, detalhamento de habilidades técnicas e estudos estratégicos de jogo.",
        "about.basketballCoverage": "Basquete - Esquemas ofensivos e defensivos, análise da técnica do jogador e detalhamento de jogadas.",
        "about.valuesText": "Precisão, profundidade e valor educacional impulsionam tudo o que fazemos. Acreditamos em ir além do placar para entender o 'como' e o 'porquê' por trás de cada jogada.",
        "about.foundationText": "Fundado com a paixão de entender o jogo profundamente, The Sports Chronicle traz para você análises táticas aprofundadas e insights técnicos especializados. Nossa missão é ajudar atletas, treinadores e entusiastas a entender as nuances estratégicas e habilidades que definem o sucesso nos esportes competitivos."
    },
    // Russian
    ru: {
        "about.missionText": "Мы стремимся быть главным источником углубленного тактического и технического спортивного анализа. Наша цель - деконструировать сложные игровые моменты и техники, помогая энтузиастам понять стратегическую глубину игры.",
        "about.footballCoverage": "Футбол - Анализ тактических схем, разбор технических навыков и стратегические исследования игры.",
        "about.basketballCoverage": "Баскетбол - Схемы нападения и защиты, анализ техники игроков и детальный разбор игровых комбинаций.",
        "about.valuesText": "Точность, глубина и образовательная ценность движут всем, что мы делаем. Мы верим в то, что нужно выходить за рамки счета матча, чтобы понять 'как' и 'почему' стоит за каждым игровым моментом.",
        "about.foundationText": "Основанный на страсти к глубокому пониманию игры, The Sports Chronicle предлагает вам углубленный тактический анализ и экспертные технические знания. Наша миссия - помочь спортсменам, тренерам и энтузиастам понять стратегические нюансы и навыки, определяющие успех в соревновательном спорте."
    },
    // Polish
    pl: {
        "about.missionText": "Dążymy do bycia głównym źródłem dogłębnych analiz taktycznych i technicznych w sporcie. Naszym celem jest dekonstrukcja złożonych zagrań i technik, pomagając entuzjastom zrozumieć strategiczną głębię gry.",
        "about.footballCoverage": "Piłka nożna - Analiza formacji taktycznych, rozbiór umiejętności technicznych i strategiczne studia meczowe.",
        "about.basketballCoverage": "Koszykówka - Schematy ofensywne i defensywne, analiza techniki zawodników oraz szczegółowy rozbiór zagrywek.",
        "about.valuesText": "Precyzja, głębia i wartość edukacyjna napędzają wszystko, co robimy. Wierzymy w wykraczanie poza wynik meczu, aby zrozumieć 'jak' i 'dlaczego' stojące za każdym zagraniem.",
        "about.foundationText": "Założone z pasji do głębokiego zrozumienia gry, The Sports Chronicle dostarcza dogłębne analizy taktyczne i ekspertów wgląd techniczny. Naszą misją jest pomoc sportowcom, trenerom i entuzjastom w zrozumieniu strategicznych niuansów i umiejętności, które definiują sukces w sporcie wyczynowym."
    },
    // Dutch
    nl: {
        "about.missionText": "We streven ernaar de voornaamste bron te zijn voor diepgaande tactische en technische sportanalyses. Ons doel is om complexe spelmomenten en technieken te ontleden, zodat liefhebbers de strategische diepgang van het spel begrijpen.",
        "about.footballCoverage": "Voetbal - Analyse van tactische formaties, uitsplitsing van technische vaardigheden en strategische spelstudies.",
        "about.basketballCoverage": "Basketbal - Aanvallende en verdedigende schema's, analyse van spelerstechniek en gedetailleerde uitsplitsing van tactieken.",
        "about.valuesText": "Precisie, diepgang en educatieve waarde drijven alles wat we doen. We geloven in verder kijken dan de score om het 'hoe' en 'waarom' achter elk spelmoment te begrijpen.",
        "about.foundationText": "Opgericht met een passie om het spel diepgaand te begrijpen, brengt The Sports Chronicle u diepgaande tactische analyses en deskundige technische inzichten. Onze missie is om atleten, coaches en liefhebbers te helpen de strategische nuances en vaardigheden te begrijpen die succes in competitiesport definiëren."
    },
    // Swedish
    sv: {
        "about.missionText": "Vi strävar efter att vara den främsta källan för djupgående taktisk och teknisk sportanalys. Vårt mål är att dekonstruera komplexa spel och tekniker för att hjälpa entusiaster att förstå spelets strategiska djup.",
        "about.footballCoverage": "Fotboll - Analys av taktiska formationer, uppdelning av tekniska färdigheter och strategiska spelstudier.",
        "about.basketballCoverage": "Basket - Offensiva och defensiva scheman, analys av spelarteknik och detaljerade genomgångar av spelböcker.",
        "about.valuesText": "Precision, djup och pedagogiskt värde driver allt vi gör. Vi tror på att gå bortom resultattavlan för att förstå 'hur' och 'varför' bakom varje spelmoment.",
        "about.foundationText": "Grundat med en passion för att förstå spelet på djupet, ger The Sports Chronicle dig djupgående taktisk analys och experttekniska insikter. Vårt uppdrag är att hjälpa idrottare, tränare och entusiaster att förstå de strategiska nyanser och färdigheter som definierar framgång inom tävlingsidrott."
    },
    // Norwegian
    no: {
        "about.missionText": "Vi streber etter å være den fremste kilden for grundig taktisk og teknisk sportsanalyse. Målet vårt er å dekonstruere komplekse spill og teknikker, og hjelpe entusiaster med å forstå spillets strategiske dybde.",
        "about.footballCoverage": "Fotball - Analyse av taktiske formasjoner, nedbryting av tekniske ferdigheter og strategiske spillstudier.",
        "about.basketballCoverage": "Basketball - Offensive og defensive skjemaer, analyse av spillerteknikk og detaljerte gjennomganger av taktikker.",
        "about.valuesText": "Presisjon, dybde og pedagogisk verdi driver alt vi gjør. Vi tror på å gå forbi resultattavlen for å forstå 'hvordan' og 'hvorfor' bak hvert spill.",
        "about.foundationText": "Grunnlagt med en lidenskap for å forstå spillet dypt, gir The Sports Chronicle deg grundig taktisk analyse og ekspertteknisk innsikt. Vårt oppdrag er å hjelpe idrettsutøvere, trenere og entusiaster med å forstå de strategiske nyansene og ferdighetene som definerer suksess i konkurranseidrett."
    },
    // Danish
    da: {
        "about.missionText": "Vi stræber efter at være den primære kilde til dybdegående taktisk og teknisk sportsanalyse. Vores mål er at dekonstruere komplekse spil og teknikker for at hjælpe entusiaster med at forstå spillets strategiske dybde.",
        "about.footballCoverage": "Fodbold - Analyse af taktiske formationer, opdeling af tekniske færdigheder og strategiske spilstudier.",
        "about.basketballCoverage": "Basketball - Offensive og defensive skemaer, analyse af spillerteknik og detaljerede gennemgange af taktikker.",
        "about.valuesText": "Præcision, dybde og pædagogisk værdi driver alt, hvad vi gør. Vi tror på at gå bag om resultatet for at forstå 'hvordan' og 'hvorfor' bag hvert spil.",
        "about.foundationText": "Grundlagt med en passion for at forstå spillet dybt, bringer The Sports Chronicle dig dybdegående taktisk analyse og ekspertteknisk indsigt. Vores mission er at hjælpe atleter, trænere og entusiaster med at forstå de strategiske nuancer og færdigheder, der definerer succes i konkurrencesport."
    },
    // Finnish
    fi: {
        "about.missionText": "Pyrimme olemaan johtava lähde syvälliselle taktiselle ja tekniselle urheiluanalyysille. Tavoitteenamme on purkaa monimutkaisia pelejä ja tekniikoita, auttaen harrastajia ymmärtämään pelin strategista syvyyttä.",
        "about.footballCoverage": "Jalkapallo - Taktisten muodostelmien analyysi, teknisten taitojen erittely ja strategiset pelitutkimukset.",
        "about.basketballCoverage": "Koripallo - Hyökkäys- ja puolustuskaaviot, pelaajatekniikan analyysi ja yksityiskohtaiset pelikirjojen erittelyt.",
        "about.valuesText": "Tarkkuus, syvyys ja koulutuksellinen arvo ohjaavat kaikkea tekemistämme. Uskomme tulostaulun taakse katsomiseen ymmärtääksemme 'miten' ja 'miksi' jokaisen pelin takana.",
        "about.foundationText": "Perustettu intohimosta ymmärtää peliä syvällisesti, The Sports Chronicle tuo sinulle syvällistä taktista analyysiä ja asiantuntevaa teknistä näkemystä. Missiomme on auttaa urheilijoita, valmentajia ja harrastajia ymmärtämään strategiset vivahteet ja taidot, jotka määrittelevät menestyksen kilpaurheilussa."
    },
    // Chinese
    zh: {
        "about.missionText": "我们致力于成为深度战术和技术体育分析的首选来源。我们的目标是解构复杂的战术和技术，帮助爱好者理解比赛的战略深度。",
        "about.footballCoverage": "足球 - 战术阵型分析、技术技能分解和战略比赛研究。",
        "about.basketballCoverage": "篮球 - 进攻和防守方案、球员技术分析和详细的战术手册分解。",
        "about.valuesText": "精确性、深度和教育价值推动着我们所做的一切。我们相信要超越比分，去理解每一个战术背后的“如何”和“为什么”。",
        "about.foundationText": "The Sports Chronicle 建立在对深刻理解比赛的热情之上，为您带来深度的战术分析和专家的技术见解。我们的使命是帮助运动员、教练和爱好者理解定义竞技体育成功的战略细微差别和技能。"
    },
    // Japanese
    ja: {
        "about.missionText": "私たちは、詳細な戦術的および技術的なスポーツ分析の主要な情報源となることを目指しています。私たちの目標は、複雑なプレーや技術を解明し、愛好家がゲームの戦略的な深さを理解するのを助けることです。",
        "about.footballCoverage": "サッカー - 戦術的フォーメーション分析、技術的スキルの内訳、および戦略的な試合研究。",
        "about.basketballCoverage": "バスケットボール - 攻撃および防御のスキーム、プレーヤーの技術分析、および詳細なプレイブックの内訳。",
        "about.valuesText": "正確さ、深さ、そして教育的価値が私たちのすべての活動を推進しています。私たちは、スコアラインを超えて、すべてのプレーの背後にある「どのように」と「なぜ」を理解することを信じています。",
        "about.foundationText": "ゲームを深く理解するという情熱を持って設立された The Sports Chronicle は、詳細な戦術分析と専門的な技術的洞察を提供します。私たちの使命は、アスリート、コーチ、愛好家が、競争力のあるスポーツで成功を定義する戦略的なニュアンスとスキルを理解するのを支援することです。"
    },
    // Korean
    ko: {
        "about.missionText": "우리는 심층적인 전술 및 기술 스포츠 분석의 최고의 소스가 되기 위해 노력합니다. 우리의 목표는 복잡한 플레이와 기술을 해체하여 애호가들이 게임의 전략적 깊이를 이해하도록 돕는 것입니다.",
        "about.footballCoverage": "축구 - 전술 포메이션 분석, 기술 스킬 분석 및 전략적 게임 연구.",
        "about.basketballCoverage": "농구 - 공격 및 수비 계획, 선수 기술 분석 및 상세한 플레이북 분석.",
        "about.valuesText": "정확성, 깊이 및 교육적 가치가 우리가 하는 모든 일을 이끕니다. 우리는 점수판을 넘어 모든 플레이 뒤에 있는 '어떻게'와 '왜'를 이해하는 것을 믿습니다.",
        "about.foundationText": "게임을 깊이 이해하려는 열정으로 설립된 The Sports Chronicle은 심층적인 전술 분석과 전문적인 기술 통찰력을 제공합니다. 우리의 임무는 운동 선수, 코치 및 애호가가 경쟁 스포츠에서 성공을 정의하는 전략적 뉘앙스와 기술을 이해하도록 돕는 것입니다."
    },
    // Hindi
    hi: {
        "about.missionText": "हम गहन सामरिक और तकनीकी खेल विश्लेषण के लिए प्रमुख स्रोत बनने का प्रयास करते हैं। हमारा लक्ष्य जटिल नाटकों और तकनीकों को डिकंस्ट्रक्ट करना है, जिससे उत्साही लोगों को खेल की रणनीतिक गहराई को समझने में मदद मिल सके।",
        "about.footballCoverage": "फुटबॉल - सामरिक गठन विश्लेषण, तकनीकी कौशल का विश्लेषण और रणनीतिक खेल अध्ययन।",
        "about.basketballCoverage": "बास्केटबॉल - आक्रामक और रक्षात्मक योजनाएं, खिलाड़ी तकनीक विश्लेषण और विस्तृत प्लेबुक विश्लेषण।",
        "about.valuesText": "सटीकता, गहराई और शैक्षिक मूल्य हमारे हर काम को संचालित करते हैं। हम हर खेल के पीछे 'कैसे' और 'क्यों' को समझने के लिए स्कोरलाइन से परे जाने में विश्वास करते हैं।",
        "about.foundationText": "खेल को गहराई से समझने के जुनून के साथ स्थापित, The Sports Chronicle आपके लिए गहन सामरिक विश्लेषण और विशेषज्ञ तकनीकी अंतर्दृष्टि लाता है। हमारा मिशन एथलीटों, कोचों और उत्साही लोगों को उन रणनीतिक बारीकियों और कौशल को समझने में मदद करना है जो प्रतिस्पर्धी खेलों में सफलता को परिभाषित करते हैं।"
    },
    // Bengali
    bn: {
        "about.missionText": "আমরা গভীর কৌশলগত এবং প্রযুক্তিগত ক্রীড়া বিশ্লেষণের জন্য প্রধান উৎস হতে চেষ্টা করি। আমাদের লক্ষ্য জটিল খেলা এবং কৌশলগুলিকে বিশ্লেষণ করা, যা উৎসাহীদের খেলার কৌশলগত গভীরতা বুঝতে সাহায্য করে।",
        "about.footballCoverage": "ফুটবল - কৌশলগত গঠন বিশ্লেষণ, প্রযুক্তিগত দক্ষতার বিবরণ এবং কৌশলগত গেম স্টাডিজ।",
        "about.basketballCoverage": "বাস্কেটবল - আক্রমণাত্মক এবং রক্ষণাত্মক পরিকল্পনা, খেলোয়াড়ের কৌশল বিশ্লেষণ এবং বিস্তারিত প্লেবুক বিশ্লেষণ।",
        "about.valuesText": "নির্ভুলতা, গভীরতা এবং শিক্ষাগত মূল্য আমাদের সব কাজকে চালিত করে। আমরা প্রতিটি খেলার পিছনের 'কিভাবে' এবং 'কেন' বুঝতে স্কোরলাইনের বাইরে যাওয়ায় বিশ্বাসী।",
        "about.foundationText": "খেলাটিকে গভীরভাবে বোঝার আবেগের সাথে প্রতিষ্ঠিত, The Sports Chronicle আপনার জন্য গভীর কৌশলগত বিশ্লেষণ এবং বিশেষজ্ঞ প্রযুক্তিগত অন্তর্দৃষ্টি নিয়ে আসে। আমাদের লক্ষ্য ক্রীড়াবিদ, কোচ এবং উৎসাহীদের কৌশলগত সূক্ষ্মতা এবং দক্ষতা বুঝতে সাহায্য করা যা প্রতিযোগিতামূলক খেলাধুলায় সাফল্যকে সংজ্ঞায়িত করে।"
    },
    // Tamil
    ta: {
        "about.missionText": "ஆழமான தந்திரோபாய மற்றும் தொழில்நுட்ப விளையாட்டு பகுப்பாய்விற்கான முதன்மை ஆதாரமாக இருக்க நாங்கள் முயல்கிறோம். சிக்கலான நாடகங்கள் மற்றும் நுட்பங்களை சிதைப்பதே எங்கள் குறிக்கோள், ஆர்வலர்களுக்கு விளையாட்டின் மூலோபாய ஆழத்தைப் புரிந்துகொள்ள உதவுகிறது.",
        "about.footballCoverage": "கால்பந்து - தந்திரோபாய உருவாக்க பகுப்பாய்வு, தொழில்நுட்ப திறன் முறிவுகள் மற்றும் மூலோபாய விளையாட்டு ஆய்வுகள்.",
        "about.basketballCoverage": "கூடைப்பந்து - தாக்குதல் மற்றும் தற்காப்பு திட்டங்கள், வீரர் நுட்ப பகுப்பாய்வு மற்றும் விரிவான பிளேபுக் முறிவுகள்.",
        "about.valuesText": "துல்லியம், ஆழம் மற்றும் கல்வி மதிப்பு ஆகியவை நாங்கள் செய்யும் அனைத்தையும் இயக்குகின்றன. ஒவ்வொரு விளையாட்டுக்கும் பின்னால் உள்ள 'எப்படி', 'ஏன்' என்பதைப் புரிந்து கொள்ள ஸ்கோர்லைனுக்கு அப்பால் செல்வதை நாங்கள் நம்புகிறோம்.",
        "about.foundationText": "விளையாட்டை ஆழமாகப் புரிந்துகொள்ளும் ஆர்வத்துடன் நிறுவப்பட்ட தி ஸ்போர்ட்ஸ் குரோனிக்கிள் உங்களுக்கு ஆழ்ந்த தந்திரோபாய பகுப்பாய்வு மற்றும் நிபுணர் தொழில்நுட்ப நுண்ணறிவுகளை வழங்குகிறது. விளையாட்டு வீரர்கள், பயிற்சியாளர்கள் மற்றும் ஆர்வலர்கள் போட்டி விளையாட்டுகளில் வெற்றியை வரையறுக்கும் மூலோபாய நுணுக்கங்கள் மற்றும் திறன்களைப் புரிந்துகொள்ள உதவுவதே எங்கள் நோக்கம்."
    },
    // Telugu
    te: {
        "about.missionText": "లోతైన వ్యూహాత్మక మరియు సాంకేతిక క్రీడా విశ్లేషణలకు ప్రధాన వనరుగా ఉండటానికి మేము ప్రయత్నిస్తున్నాము. సంక్లిష్టమైన నాటకాలు మరియు సాంకేతికతలను విడదీయడం మా లక్ష్యం, ఔత్సాహికులకు ఆట యొక్క వ్యూహాత్మక లోతును అర్థం చేసుకోవడంలో సహాయపడుతుంది.",
        "about.footballCoverage": "ఫుట్‌బాల్ - వ్యూహాత్మక నిర్మాణం విశ్లేషణ, సాంకేతిక నైపుణ్య విచ్ఛిన్నాలు మరియు వ్యూహాత్మక గేమ్ అధ్యయనాలు.",
        "about.basketballCoverage": "బాస్కెట్‌బాల్ - ప్రమాదకర మరియు రక్షణాత్మక స్కీమ్‌లు, ప్లేయర్ టెక్నిక్ విశ్లేషణ మరియు వివరణాత్మక ప్లేబుక్ బ్రేక్‌డౌన్‌లు.",
        "about.valuesText": "ఖచ్చితత్వం, లోతు మరియు విద్యా విలువలు మేము చేసే ప్రతి పనిని నడిపిస్తాయి. ప్రతి ఆట వెనుక ఉన్న 'ఎలా' మరియు 'ఎందుకు' అని అర్థం చేసుకోవడానికి స్కోర్‌లైన్‌ను దాటి వెళ్లాలని మేము నమ్ముతున్నాము.",
        "about.foundationText": "ఆటను లోతుగా అర్థం చేసుకోవాలనే అభిరుచిలో స్థాపించబడిన ది స్పోర్ట్స్ క్రానికల్ మీకు లోతైన వ్యూహాత్మక విశ్లేషణ మరియు నిపుణుల సాంకేతిక అంతర్దృష్టులను అందిస్తుంది. అథ్లెట్లు, కోచ్‌లు మరియు ఔత్సాహికులు పోటీ క్రీడలలో విజయాన్ని నిర్వచించే వ్యూహాత్మక సూక్ష్మ నైపుణ్యాలు మరియు నైపుణ్యాలను అర్థం చేసుకోవడంలో సహాయపడటం మా లక్ష్యం."
    },
    // Marathi
    mr: {
        "about.missionText": "आम्ही सखोल रणनीतिक आणि तांत्रिक क्रीडा विश्लेषणासाठी प्रमुख स्रोत बनण्याचा प्रयत्न करतो. आमचे ध्येय गुंतागुंतीचे खेळ आणि तंत्रांचे पृथक्करण करणे आहे, जे उत्साही लोकांना खेळाची रणनीतिक खोली समजण्यास मदत करते.",
        "about.footballCoverage": "फुटबॉल - रणनीतिक निर्मिती विश्लेषण, तांत्रिक कौशल्य ब्रेकडाउन आणि धोरणात्मक गेम अभ्यास.",
        "about.basketballCoverage": "बास्केटबॉल - आक्रमक आणि बचावात्मक योजना, खेळाडू तंत्र विश्लेषण आणि तपशीलवार प्लेबुक ब्रेकडाउन.",
        "about.valuesText": "अचूकता, खोली आणि शैक्षणिक मूल्य आम्ही करत असलेल्या प्रत्येक गोष्टीला चालना देते. प्रत्येक खेळाच्या मागे 'कसे' आणि 'का' समजून घेण्यासाठी आम्ही स्कोअरलाइनच्या पलीकडे जाण्यावर विश्वास ठेवतो.",
        "about.foundationText": "खेळाला सखोलपणे समजून घेण्याच्या आवडीने स्थापित, The Sports Chronicle तुमच्यासाठी सखोल रणनीतिक विश्लेषण आणि तज्ञ तांत्रिक अंतर्दृष्टी घेऊन येते. आमचे ध्येय खेळाडू, प्रशिक्षक आणि उत्साही लोकांना स्पर्धात्मक खेळांमध्ये यशाची व्याख्या करणाऱ्या धोरणात्मक बारकावे आणि कौशल्ये समजून घेण्यास मदत करणे आहे."
    },
    // Gujarati
    gu: {
        "about.missionText": "અમે ગહન વ્યૂહાત્મક અને તકનીકી રમત વિશ્લેષણ માટે મુખ્ય સ્ત્રોત બનવાનો પ્રયાસ કરીએ છીએ. અમારો ધ્યેય જટિલ નાટકો અને તકનીકોને ડિકન્સ્ટ્રક્ટ કરવાનો છે, જે ઉત્સાહીઓને રમતની વ્યૂહાત્મક ઊંડાઈ સમજવામાં મદદ કરે છે.",
        "about.footballCoverage": "ફૂટબોલ - વ્યૂહાત્મક રચના વિશ્લેષણ, તકનીકી કૌશલ્ય ભંગાણ અને વ્યૂહાત્મક રમત અભ્યાસ.",
        "about.basketballCoverage": "બાસ્કેટબોલ - આક્રમક અને રક્ષણાત્મક યોજનાઓ, પ્લેયર ટેકનિક વિશ્લેષણ અને વિગતવાર પ્લેબુક બ્રેકડાઉન.",
        "about.valuesText": "ચોકસાઇ, ઊંડાઈ અને શૈક્ષણિક મૂલ્ય અમે જે કરીએ છીએ તે બધું ચલાવે છે. દરેક નાટકની પાછળ 'કેવી રીતે' અને 'શા માટે' સમજવા માટે અમે સ્કોરલાઇનથી આગળ વધવામાં માનીએ છીએ.",
        "about.foundationText": "રમતને ઊંડાણપૂર્વક સમજવાના જુસ્સા સાથે સ્થાપિત, ધ સ્પોર્ટ્સ ક્રોનિકલ તમારા માટે ગહન વ્યૂહાત્મક વિશ્લેષણ અને નિષ્ણાત તકનીકી આંતરદૃષ્ટિ લાવે છે. અમારું મિશન એથ્લેટ્સ, કોચ અને ઉત્સાહીઓને સ્પર્ધાત્મક રમતોમાં સફળતાને વ્યાખ્યાયિત કરતી વ્યૂહાત્મક ઘોંઘાટ અને કૌશલ્યોને સમજવામાં મદદ કરવાનું છે."
    },
    // Arabic
    ar: {
        "about.missionText": "نسعى لأن نكون المصدر الأول للتحليل الرياضي التكتيكي والتقني المتعمق. هدفنا هو تفكيك اللعب والتقنيات المعقدة، ومساعدة المتحمسين على فهم العمق الاستراتيجي للعبة.",
        "about.footballCoverage": "كرة القدم - تحليل التشكيل التكتيكي، وتفصيل المهارات الفنية، ودراسات اللعبة الاستراتيجية.",
        "about.basketballCoverage": "كرة السلة - المخططات الهجومية والدفاعية، وتحليل تقنية اللاعب، وتفصيل سجل اللعب التفصيلي.",
        "about.valuesText": "الدقة والعمق والقيمة التعليمية تقود كل ما نقوم به. نؤمن بتجاوز النتيجة لفهم 'كيف' و 'لماذا' وراء كل لعبة.",
        "about.foundationText": "تأسست The Sports Chronicle بشغف لفهم اللعبة بعمق، وتجلب لك تحليلًا تكتيكيًا متعمقًا ورؤى فنية خبيرة. مهمتنا هي مساعدة الرياضيين والمدربين والمتحمسين على فهم الفروق الدقيقة الاستراتيجية والمهارات التي تحدد النجاح في الرياضات التنافسية."
    },
    // Hebrew
    he: {
        "about.missionText": "אנו שואפים להיות המקור המוביל לניתוח ספורט טקטי וטכני מעמיק. המטרה שלנו היא לפרק מהלכים וטכניקות מורכבים, ולעזור לחובבים להבין את העומק האסטרטגי של המשחק.",
        "about.footballCoverage": "כדורגל - ניתוח מערך טקטי, פירוט מיומנויות טכניות ומחקרים אסטרטגיים של המשחק.",
        "about.basketballCoverage": "כדורסל - תוכניות התקפיות והגנתיות, ניתוח טכניקת שחקן ופירוט פלייבוק מפורט.",
        "about.valuesText": "דיוק, עומק וערך חינוכי מניעים כל מה שאנו עושים. אנו מאמינים בללכת מעבר לתוצאה כדי להבין את ה'איך' וה'למה' מאחורי כל מהלך.",
        "about.foundationText": "The Sports Chronicle, שנוסד מתוך תשוקה להבנת המשחק לעומק, מביא לכם ניתוח טקטי מעמיק ותובנות טכניות של מומחים. המשימה שלנו היא לעזור לספורטאים, מאמנים וחובבים להבין את הניואנסים והכישורים האסטרטגיים המגדירים הצלחה בספורט תחרותי."
    },
    // Persian
    fa: {
        "about.missionText": "ما تلاش می‌کنیم منبع اصلی تحلیل‌های عمیق تاکتیکی و فنی ورزشی باشیم. هدف ما ساختارشکنی بازی‌ها و تکنیک‌های پیچیده است تا به علاقه‌مندان کمک کنیم عمق استراتژیک بازی را درک کنند.",
        "about.footballCoverage": "فوتبال - تحلیل آرایش تاکتیکی، تفکیک مهارت‌های فنی و مطالعات استراتژیک بازی.",
        "about.basketballCoverage": "بسکتبال - طرح‌های هجومی و دفاعی، تحلیل تکنیک بازیکن و تفکیک دقیق کتاب بازی.",
        "about.valuesText": "دقت، عمق و ارزش آموزشی همه کارهای ما را هدایت می‌کند. ما معتقدیم که باید فراتر از نتیجه بازی برویم تا 'چگونگی' و 'چرایی' پشت هر بازی را درک کنیم.",
        "about.foundationText": "The Sports Chronicle که با اشتیاق به درک عمیق بازی تأسیس شده است، تحلیل‌های تاکتیکی عمیق و بینش‌های فنی تخصصی را برای شما به ارمغان می‌آورد. ماموریت ما کمک به ورزشکاران، مربیان و علاقه‌مندان برای درک ظرافت‌های استراتژیک و مهارت‌هایی است که موفقیت در ورزش‌های رقابتی را تعریف می‌کنند."
    },
    // Turkish
    tr: {
        "about.missionText": "Derinlemesine taktiksel ve teknik spor analizi için önde gelen kaynak olmayı hedefliyoruz. Amacımız karmaşık oyunları ve teknikleri çözerek meraklıların oyunun stratejik derinliğini anlamalarına yardımcı olmaktır.",
        "about.footballCoverage": "Futbol - Taktiksel formasyon analizi, teknik beceri dökümleri ve stratejik oyun çalışmaları.",
        "about.basketballCoverage": "Basketbol - Hücum ve savunma şemaları, oyuncu tekniği analizi ve ayrıntılı oyun kitabı dökümleri.",
        "about.valuesText": "Hassasiyet, derinlik ve eğitim değeri yaptığımız her şeyi yönlendirir. Her oyunun arkasındaki 'nasıl' ve 'neden'i anlamak için skor tablosunun ötesine geçmeye inanıyoruz.",
        "about.foundationText": "Oyunu derinlemesine anlama tutkusuyla kurulan The Sports Chronicle, size derinlemesine taktiksel analiz ve uzman teknik görüşler sunar. Misyonumuz, sporcuların, antrenörlerin ve meraklıların rekabetçi sporlarda başarıyı tanımlayan stratejik nüansları ve becerileri anlamalarına yardımcı olmaktır."
    },
    // Thai
    th: {
        "about.missionText": "เรามุ่งมั่นที่จะเป็นแหล่งข้อมูลชั้นนำสำหรับการวิเคราะห์กีฬาทางยุทธวิธีและเทคนิคเชิงลึก เป้าหมายของเราคือการแยกแยะการเล่นและเทคนิคที่ซับซ้อน ช่วยให้ผู้ที่ชื่นชอบเข้าใจความลึกซึ้งเชิงกลยุทธ์ของเกม",
        "about.footballCoverage": "ฟุตบอล - การวิเคราะห์รูปแบบทางยุทธวิธี การแยกย่อยทักษะทางเทคนิค และการศึกษาเกมเชิงกลยุทธ์",
        "about.basketballCoverage": "บาสเกตบอล - แผนการรุกและรับ การวิเคราะห์เทคนิคของผู้เล่น และการแยกย่อย playbook โดยละเอียด",
        "about.valuesText": "ความแม่นยำ ความลึกซึ้ง และคุณค่าทางการศึกษาขับเคลื่อนทุกสิ่งที่เราทำ เราเชื่อในการมองข้ามสกอร์บอร์ดเพื่อทำความเข้าใจ 'วิธีการ' และ 'ทำไม' เบื้องหลังทุกการเล่น",
        "about.foundationText": "ก่อตั้งขึ้นด้วยความหลงใหลในการทำความเข้าใจเกมอย่างลึกซึ้ง The Sports Chronicle นำเสนอการวิเคราะห์ทางยุทธวิธีเชิงลึกและข้อมูลเชิงลึกทางเทคนิคจากผู้เชี่ยวชาญ ภารกิจของเราคือการช่วยให้นักกีฬา โค้ช และผู้ที่ชื่นชอบเข้าใจถึงความแตกต่างเชิงกลยุทธ์และทักษะที่กำหนดความสำเร็จในกีฬาการแข่งขัน"
    }
};

const missingLangs = {
    // Simple fallback for languages I missed or are minor, just using default English or empty to avoid crash if they exist in file.
    // Actually, better to leave them alone if I don't have translation, but user said "All languages".
    // I covered the major ones found in directory. I'll check directory again.
};

async function updateTranslations() {
    try {
        const files = fs.readdirSync(translationsDir);

        for (const file of files) {
            if (!file.endsWith('.json')) continue;
            if (file === 'about.json' || file === 'admin.json' || file === 'auth.json' || file === 'blog.json' || file === 'common.json' || file === 'hero.json') continue; // Skip non-language files

            const langCode = file.replace('.json', '');
            const filePath = path.join(translationsDir, file);

            console.log(`Processing ${langCode}...`);
            let content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            // Get translations for this language
            const updates = newContent[langCode];

            if (updates) {
                console.log(`  Updating ${langCode} with specific translations.`);
                Object.assign(content, updates);
            } else {
                console.log(`  No specific translation for ${langCode}, using English fallback for consistency with new Meaning.`);
                // Use English if no translation found, to ensure meaning is correct as per user request
                Object.assign(content, newContent['en']);
            }

            fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
        }
        console.log('All translations updated successfully.');
    } catch (error) {
        console.error('Error updating translations:', error);
        process.exit(1);
    }
}

updateTranslations();
