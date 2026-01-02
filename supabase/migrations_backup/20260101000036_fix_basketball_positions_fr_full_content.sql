UPDATE blog_posts
SET translations = jsonb_set(
    translations,
    '{fr, content}',
    to_jsonb(
        '<h4><strong>1. Meneur (PG)</strong></h4>' ||
        '<p>Souvent appelé le "général du parquet", le meneur est responsable de diriger l''attaque de l''équipe.</p>' ||
        '<ul><li>Rôle principal : Diriger les jeux, distribuer le ballon et maintenir le tempo du jeu.</li>'
        '<li>Compétences clés : Dribble exceptionnel, précision de passe, vision du terrain et leadership.</li>'
        '<li>Exemple célèbre : Chris Paul est connu pour son élite en matière de création de jeu et de contrôle du jeu.</li></ul>'
        '<h4><strong>2. Arrière (SG)</strong></h4>'
        '<p>L''arrière est généralement le meilleur marqueur de l''équipe à l''extérieur.</p>'
        '<ul><li>Rôle principal : Marquer des points, en particulier à trois points, et aider à créer des jeux offensifs.</li>'
        '<li>Compétences clés : Précision de tir, capacité à pénétrer au panier et défense solide.</li>'
        '<li>Exemple célèbre : Klay Thompson est réputé pour sa capacité à "attraper et tirer" et sa défense extérieure.</li></ul>'
        '<h4><strong>3. Ailier (SF)</strong></h4>'
        '<p>Connu comme le joueur le plus polyvalent, l''ailier peut s''adapter à différents rôles sur le terrain.</p>'
        '<ul><li>Rôle principal : Contribuer à la marque, à la défense et aux rebonds.</li>'
        '<li>Compétences clés : Athlétisme, tir à mi-distance, polyvalence aux deux extrémités du terrain.</li>'
        '<li>Exemple célèbre : LeBron James excelle en tant qu''ailier "tout-en-un".</li></ul>'
        '<h4><strong>4. Ailier fort (PF)</strong></h4>'
        '<p>L''ailier fort joue près du panier et combine la force avec la capacité de marquer.</p>'
        '<ul><li>Rôle principal : Assurer les rebonds, marquer dans la raquette et étirer le terrain si nécessaire.</li>'
        '<li>Compétences clés : Physique, mouvements de poste, rebonds et parfois tir à trois points.</li>'
        '<li>Exemple célèbre : Giannis Antetokounmpo domine en tant qu''ailier fort moderne avec un athlétisme inégalé.</li></ul>'
        '<h4><strong>5. Pivot (C)</strong></h4>'
        '<p>Le pivot est généralement le joueur le plus grand de l''équipe et une ancre défensive.</p>'
        '<ul><li>Rôle principal : Protéger le cercle, prendre les rebonds et marquer au poste bas.</li>'
        '<li>Compétences clés : Contre, défense intérieure, rebonds et finition efficace.</li>'
        '<li>Exemple célèbre : Nikola Jokić combine la domination dans la raquette avec une excellente passe.</li></ul>'
        '<h4><strong>Conclusion</strong></h4>'
        '<p>Chaque position de basket-ball a un but crucial, et une équipe prospère lorsque les joueurs embrassent pleinement leurs rôles. Que ce soit le meneur organisant l''attaque ou le pivot contrôlant la raquette, la compréhension de ces positions améliore à la fois le jeu et l''observation du jeu.</p>'
    )
)
WHERE slug = 'basketball-positions-and-their-roles-a-complete-guide';