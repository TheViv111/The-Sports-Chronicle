UPDATE blog_posts
SET translations = jsonb_set(
    translations,
    '{it, content}',
    to_jsonb(
        '<h4><strong>1. Playmaker (PG)</strong></h4>' ||
        '<p>Spesso chiamato il "generale del campo", il playmaker è responsabile della gestione dell\'attacco della squadra.</p>' ||
        '<ul><li>Ruolo principale: Dirigere le giocate, distribuire la palla e mantenere il ritmo di gioco.</li>'
        '<li>Competenza chiave: Dribbling eccezionale, precisione nei passaggi, visione di campo e leadership.</li>'
        '<li>Esempio famoso: Chris Paul è noto per la sua élite nella creazione di gioco e il controllo del gioco.</li></ul>'
        '<h4><strong>2. Guardia tiratrice (SG)</strong></h4>'
        '<p>La guardia tiratrice è solitamente il miglior realizzatore della squadra dalla periferia.</p>'
        '<ul><li>Ruolo principale: Segnare punti, specialmente da tre punti, e assistere nella creazione di giocate offensive.</li>'
        '<li>Competenza chiave: Precisione di tiro, capacità di penetrare a canestro e solida difesa.</li>'
        '<li>Esempio famoso: Klay Thompson è rinomato per la sua capacità di "catch-and-shoot" e la sua difesa perimetrale.</li></ul>'
        '<h4><strong>3. Ala piccola (SF)</strong></h4>'
        '<p>Conosciuto come il giocatore più versatile, l\'ala piccola può adattarsi a diversi ruoli in campo.</p>'
        '<ul><li>Ruolo principale: Contribuire alla marcatura, alla difesa e ai rimbalzi.</li>'
        '<li>Competenza chiave: Atletismo, tiro dalla media distanza, versatilità in entrambi i lati del campo.</li>'
        '<li>Esempio famoso: LeBron James eccelle come ala piccola "tuttofare".</li></ul>'
        '<h4><strong>4. Ala grande (PF)</strong></h4>'
        '<p>L\'ala grande gioca vicino al canestro e combina forza con capacità di segnare.</p>'
        '<ul><li>Ruolo principale: Assicurare i rimbalzi, segnare nel pitturato ed allargare il campo se necessario.</li>'
        '<li>Competenza chiave: Fisicità, movimenti in post, rimbalzi e, a volte, tiro da tre punti.</li>'
        '<li>Esempio famoso: Giannis Antetokounmpo domina come ala grande moderna con un atletismo ineguagliabile.</li></ul>'
        '<h4><strong>5. Centro (C)</strong></h4>'
        '<p>Il centro è solitamente il giocatore più alto della squadra e un\'ancora difensiva.</p>'
        '<ul><li>Ruolo principale: Proteggere il ferro, prendere rimbalzi e segnare nel post basso.</li>'
        '<li>Competenza chiave: Stoppate, difesa interna, rimbalzi e finalizzazione efficiente.</li>'
        '<li>Esempio famoso: Nikola Jokić combina il dominio nel pitturato con un\'eccellente capacità di passaggio.</li></ul>'
        '<h4><strong>Conclusione</strong></h4>'
        '<p>Ogni posizione nel basket ha uno scopo cruciale, e una squadra prospera quando i giocatori abbracciano pienamente i loro ruoli. Che sia il playmaker che ordisce l\'attacco o il centro che controlla il pitturato, la comprensione di queste posizioni migliora sia il gioco che la visione dello stesso.</p>'
    )
)
WHERE slug = 'basketball-positions-and-their-roles-a-complete-guide';