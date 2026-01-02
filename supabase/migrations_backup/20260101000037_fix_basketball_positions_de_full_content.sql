UPDATE blog_posts
SET translations = jsonb_set(
    translations,
    '{de, content}',
    to_jsonb(
        '<h4><strong>1. Point Guard (PG)</strong></h4>' ||
        '<p>Oft als "Feldgeneral" bezeichnet, ist der Point Guard für die Leitung der Offensive des Teams verantwortlich.</p>' ||
        '<ul><li>Primäre Rolle: Spielzüge leiten, den Ball verteilen und das Spieltempo aufrechterhalten.</li>'
        '<li>Schlüsselkompetenzen: Außergewöhnliches Dribbling, Passgenauigkeit, Spielfeldübersicht und Führung.</li>'
        '<li>Berühmtes Beispiel: Chris Paul ist bekannt für sein elitäres Spielgestaltungs- und Spielkontrollvermögen.</li></ul>'
        '<h4><strong>2. Shooting Guard (SG)</strong></h4>'
        '<p>Der Shooting Guard ist normalerweise der beste Werfer des Teams von außerhalb der Zone.</p>'
        '<ul><li>Primäre Rolle: Punkte erzielen, insbesondere aus der Dreipunktedistanz, und bei der Schaffung von Angriffsspielzügen helfen.</li>'
        '<li>Schlüsselkompetenzen: Treffsicherheit beim Wurf, Fähigkeit zum Korbleger und solide Verteidigung.</li>'
        '<li>Berühmtes Beispiel: Klay Thompson ist bekannt für seine Catch-and-Shoot-Fähigkeit und seine Perimeter-Verteidigung.</li></ul>'
        '<h4><strong>3. Small Forward (SF)</strong></h4>'
        '<p>Als vielseitigster Spieler bekannt, kann sich der Small Forward an verschiedene Rollen auf dem Spielfeld anpassen.</p>'
        '<ul><li>Primäre Rolle: Zum Scoring, zur Verteidigung und zu Rebounds beitragen.</li>'
        '<li>Schlüsselkompetenzen: Athletik, Mid-Range-Wurf, Vielseitigkeit an beiden Enden des Feldes.</li>'
        '<li>Berühmtes Beispiel: LeBron James zeichnet sich als Alleskönner auf der Small Forward-Position aus.</li></ul>'
        '<h4><strong>4. Power Forward (PF)</strong></h4>'
        '<p>Der Power Forward spielt in Korbnähe und kombiniert Stärke mit Scoring-Fähigkeiten.</p>'
        '<ul><li>Primäre Rolle: Rebounds sichern, in der Zone punkten und bei Bedarf den Raum öffnen.</li>'
        '<li>Schlüsselkompetenzen: Körperlichkeit, Post-Moves, Rebounding und manchmal Dreipunktewürfe.</li>'
        '<li>Berühmtes Beispiel: Giannis Antetokounmpo dominiert als moderner Power Forward mit unerreichter Athletik.</li></ul>'
        '<h4><strong>5. Center (C)</strong></h4>'
        '<p>Der Center ist normalerweise der größte Spieler im Team und ein defensiver Anker.</p>'
        '<ul><li>Primäre Rolle: Den Korb schützen, Rebounds holen und im Low Post punkten.</li>'
        '<li>Schlüsselkompetenzen: Shot-Blocking, Innenverteidigung, Rebounding und effizientes Finishing.</li>'
        '<li>Berühmtes Beispiel: Nikola Jokić kombiniert Dominanz in der Zone mit exzellentem Passspiel.</li></ul>'
        '<h4><strong>Fazit</strong></h4>'
        '<p>Jede Basketballposition dient einem entscheidenden Zweck, und ein Team blüht auf, wenn die Spieler ihre Rollen voll und ganz annehmen. Egal, ob der Point Guard das Angriffspiel orchestriert oder der Center die Zone kontrolliert, das Verständnis dieser Positionen verbessert sowohl das Spielen als auch das Beobachten des Spiels.</p>'
    )
)
WHERE slug = 'basketball-positions-and-their-roles-a-complete-guide';