UPDATE blog_posts
SET translations = jsonb_set(
    translations,
    '{es, content}',
    to_jsonb(
        '<h4><strong>1. Base (PG)</strong></h4>' ||
        '<p>A menudo llamado el "general de la cancha", el base es responsable de dirigir la ofensiva del equipo.</p>' ||
        '<ul><li>Rol principal: Dirigir jugadas, distribuir el balón y mantener el ritmo de juego.</li>'
        '<li>Habilidades clave: Regate excepcional, precisión en los pases, visión de cancha y liderazgo.</li>'
        '<li>Ejemplo famoso: Chris Paul es conocido por su élite en la creación de juego y el control del mismo.</li></ul>'
        '<h4><strong>2. Escolta (SG)</strong></h4>'
        '<p>El escolta suele ser el mejor anotador del equipo desde el perímetro.</p>'
        '<ul><li>Rol principal: Anotar puntos, especialmente desde la línea de tres puntos, y ayudar a crear jugadas ofensivas.</li>'
        '<li>Habilidades clave: Precisión de tiro, habilidad para penetrar a canasta y una defensa sólida.</li>'
        '<li>Ejemplo famoso: Klay Thompson es reconocido por su capacidad de "atrapar y tirar" y su defensa perimetral.</li></ul>'
        '<h4><strong>3. Alero (SF)</strong></h4>'
        '<p>Conocido como el jugador más versátil, el alero puede adaptarse a diferentes roles en la cancha.</p>'
        '<ul><li>Rol principal: Contribuir en la anotación, defensa y rebotes.</li>'
        '<li>Habilidades clave: Atletismo, tiro de media distancia, versatilidad en ambos extremos de la cancha.</li>'
        '<li>Ejemplo famoso: LeBron James se destaca como un alero "todo en uno".</li></ul>'
        '<h4><strong>4. Ala-pívot (PF)</strong></h4>'
        '<p>El ala-pívot juega cerca de la canasta y combina fuerza con capacidad de anotación.</p>'
        '<ul><li>Rol principal: Asegurar rebotes, anotar en la pintura y abrir la cancha si es necesario.</li>'
        '<li>Habilidades clave: Físico, movimientos de poste, rebotes y, a veces, tiro de tres puntos.</li>'
        '<li>Ejemplo famoso: Giannis Antetokounmpo domina como un ala-pívot moderno con un atletismo inigualable.</li></ul>'
        '<h4><strong>5. Pívot (C)</strong></h4>'
        '<p>El pívot suele ser el jugador más alto del equipo y un ancla defensiva.</p>'
        '<ul><li>Rol principal: Proteger el aro, rebotear y anotar en el poste bajo.</li>'
        '<li>Habilidades clave: Bloqueo de tiros, defensa interior, rebotes y finalización eficiente.</li>'
        '<li>Ejemplo famoso: Nikola Jokić combina el dominio en la pintura con una excelente capacidad de pase.</li></ul>'
        '<h4><strong>Conclusión</strong></h4>'
        '<p>Cada posición en el baloncesto tiene un propósito crucial, y un equipo prospera cuando los jugadores adoptan plenamente sus roles. Ya sea el base orquestando la ofensiva o el pívot controlando la pintura, comprender estas posiciones mejora tanto el juego como la observación del mismo.</p>'
    )
)
WHERE slug = 'basketball-positions-and-their-roles-a-complete-guide';