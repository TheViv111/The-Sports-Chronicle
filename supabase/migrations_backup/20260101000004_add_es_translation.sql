UPDATE blog_posts
SET translations = translations || $json${
  "es": {
    "title": "El Giro de Cruyff - Simple, pero efectivo",
    "category": "Fútbol",
    "excerpt": "El giro de Cruyff es una jugada de regate icónica en el fútbol, nombrada en honor a la leyenda holandesa Johan Cruyff, que todavía es ampliamente utilizada por los jugadores para evadir a los defensores y cambiar rápidamente de dirección en el campo.",
    "content": "<h3><strong>Historia del Giro de Cruyff</strong></h3><p>Johan Cruyff ejecutó el movimiento por primera vez durante un partido de la fase de grupos entre los Países Bajos y Suecia en la Copa del Mundo de 1974.</p>"
  }
}$json$::jsonb
WHERE slug = 'the-cruyff-turn-simple-but-effective';
