/* ============================================================
   Spanish dictionary. English is never duplicated here: main.js
   harvests it from the markup itself (data-i18n / data-i18n-aria)
   and swaps in these strings when the language is "es". Keys with
   inline tags (<mark>, <b>) must mirror the tags the English
   markup carries, since they are applied as HTML fragments.
   Deliberately untranslated: skill and tool names, stack chips,
   the Python code lines in the About console, fig. labels and
   console UI flourishes (PROFILE LOADED, run, trait meters).
   ============================================================ */
window.I18N_ES = {
  /* document metadata */
  "meta.title": "José Andrés Barrientos, Analista de Datos",
  "meta.desc":
    "José Andrés Barrientos, Analista de Datos y estudiante de la Maestría en Ingeniería de Software en UMD. 4 años de analítica de cadena de suministro retail para Walmart, Target y Amazon.",

  /* header */
  "nav.resume": "CV ↓",
  "a11y.theme": "Cambiar entre tema oscuro y claro",

  /* hero */
  "hero.kicker": "Analista de datos, medido en resultados",
  "hero.intro":
    "Convierto datos desordenados de cadena de suministro y de producto en decisiones. <mark>4 años de analítica retail</mark> para las operaciones drop-ship de Walmart, Target y Amazon, ahora sumando una <mark>Maestría en Ingeniería de Software</mark> en la University of Maryland.",
  "hero.m1.unit": "años",
  "hero.m1.lbl": "experiencia en analítica de cadena de suministro",
  "hero.m2.lbl": "canales retail Fortune 500 atendidos",
  "hero.m3.lbl": "reducción de la tasa de defectos con marcos de QA",
  "hero.m4.lbl": "precisión clasificando issues con ML",
  "hero.fn1":
    "<b>1</b> Intradeco · analítica de cadena de suministro, 2021-2025",
  "hero.fn2": "<b>2</b> Canales drop-ship B2C de Walmart · Target · Amazon",
  "hero.fn3":
    "<b>3</b> SigmaQ Specialty · marcos de recolección de datos de QA, 2021",
  "hero.fn4":
    "<b>4</b> Clasificadores Random Forest / Gradient Boosting · UMD, 2025",

  /* section titles */
  "sec.about": "sobre mí",
  "sec.projects": "proyectos",
  "sec.experience": "experiencia",
  "sec.education": "educación",
  "sec.skills": "habilidades",

  /* about */
  "a11y.replay": "Repetir la animación de escritura",
  "about.c1": "# qué construí",
  "about.c2": "# qué encontré",
  "about.c3": "# hacia dónde voy",
  "about.p1":
    "Pasé cuatro años en Intradeco construyendo la capa de analítica de las operaciones drop-ship B2C de Walmart, Target y Amazon. Construí <mark>dashboards de Power BI sobre datos de SAP</mark> que dieron a los gerentes visibilidad en tiempo real de entregas, inventario y desempeño a nivel de SKU.",
  "about.p2":
    "En el camino descubrí que los problemas más valiosos vivían entre sistemas: rastreé una <mark>discrepancia en la transmisión de datos entre FedEx, Intradeco y Walmart</mark> que, una vez corregida, eliminó un error recurrente de conciliación y sus costos asociados.",
  "about.p3":
    "Autodidacta en Python y SQL, hoy estoy formalizando esa base con una Maestría en Ingeniería de Software en UMD, enfocada en <mark>machine learning, algoritmos y sistemas distribuidos</mark>.",
  "about.f1k": "Ahora",
  "about.f2k": "Antes",
  "about.f2v": "Analista de Datos @ Intradeco",
  "about.f3k": "Ubicado en",

  /* projects */
  "proj.src": "Código ↗",
  "proj.visit": "Visitar ↗",
  "proj.fineas.aria": "Abrir detalles de Fineas",
  "proj.fineas.fig": "Cofundador · pre-lanzamiento",
  "proj.fineas.statk": "pruebas automatizadas",
  "proj.fineas.status": "En desarrollo · aún sin enlace público",
  "proj.fineas.tag":
    "Hub de finanzas personales para salvadoreños: diagnóstico financiero, tracker de gastos de 3 taps y asesoría, en español, en web y móvil.",
  "proj.fineas.d1":
    "Cofundando un hub de finanzas personales para salvadoreños: diagnóstico financiero, tracker de gastos de 3 taps con rachas y reserva de asesores, todo en español.",
  "proj.fineas.d2":
    "App web en Next.js 14 y apps nativas de iOS y Android en Expo, compartiendo un monorepo TypeScript.",
  "proj.fineas.d3":
    "Backend en Supabase endurecido con row-level security, cifrado AES-256 y rate limiting; la Claude API del lado del servidor genera el análisis personalizado.",
  "proj.fineas.d4":
    "3,400+ pruebas automatizadas y 49 migraciones versionadas de base de datos mantienen la plataforma lista para el lanzamiento público.",
  "proj.gh.aria":
    "Abrir detalles de la Plataforma de Analítica de Issues de GitHub",
  "proj.gh.title": "Plataforma de Analítica de Issues de GitHub",
  "proj.gh.statk": "precisión en clasificación de prioridad",
  "proj.gh.tag":
    "Pipeline de analítica que convierte 5,200+ issues crudos de GitHub en señales de priorización.",
  "proj.gh.d1":
    "Construí un pipeline de analítica de datos que procesa 5,200+ issues de GitHub con 90% de cobertura de pruebas usando pytest.",
  "proj.gh.d2":
    "Desarrollé clasificadores Random Forest y Gradient Boosting que alcanzan 80% de precisión clasificando la prioridad de issues.",
  "proj.gh.d3":
    "Creé 7 visualizaciones interactivas en Plotly, incluyendo análisis del ciclo de vida de contribuidores y mapas de calor de participación.",
  "proj.rd.aria":
    "Abrir detalles de Detección de Daños Viales con Deep Learning",
  "proj.rd.title": "Detección de Daños Viales con Deep Learning",
  "proj.rd.statk": "reducción del tiempo de entrenamiento",
  "proj.rd.tag":
    "Clasificador de imágenes con transfer learning, comparado en cuatro arquitecturas.",
  "proj.rd.d1":
    "Construí un pipeline de clasificación para 907 imágenes usando transfer learning y aumento de datos en PyTorch.",
  "proj.rd.d2":
    "Comparé 4 arquitecturas (ResNet-18, MobileNetV3, EfficientNet-B0, ViT-Tiny) y reduje el tiempo de entrenamiento en 44%.",
  "proj.mm.aria": "Abrir detalles del Motor de Juego con IA y Minimax",
  "proj.mm.title": "Motor de Juego con IA y Minimax",
  "proj.mm.statk": "victorias/empates a profundidad 6",
  "proj.mm.tag":
    "Motor de búsqueda adversarial con poda alfa-beta y evaluación heurística.",
  "proj.mm.d1":
    "Implementé minimax con poda alfa-beta, logrando una reducción de 40-60% en la complejidad del espacio de búsqueda.",
  "proj.mm.d2":
    "Desarrollé una función de evaluación heurística; la IA logra 90%+ de victorias/empates a profundidad de búsqueda 6.",
  "proj.ma.aria": "Abrir detalles de Margaux y Arden",
  "proj.ma.fig": "Freelance",
  "proj.ma.statk": "dependencias de runtime",
  "proj.ma.tag":
    "Sitio demo de una página para un estudio ficticio de bodas de lujo en San Salvador, sin build ni librerías.",
  "proj.ma.d1":
    "Coreografié una secuencia sticky de scroll del «día de la boda» a pantalla completa: cuatro escenas en crossfade con leyendas por hora del día y una línea de progreso.",
  "proj.ma.d2":
    "Construí desde cero un lightbox con foco atrapado y un carrusel deslizable, totalmente operables con teclado y touch.",
  "proj.ma.d3":
    "Sistema de reveals con IntersectionObserver que respeta prefers-reduced-motion globalmente; Bodoni Moda y Archivo autoalojadas como WOFF2.",
  "proj.ma.d4":
    "Escribí el copy en español, localizado para el mercado salvadoreño.",

  /* experience */
  "xp.1.role": "Analista de Datos",
  "xp.1.when": "Sep 2021 a Ago 2025",
  "xp.1.d1":
    "Construí y mantuve dashboards de Power BI a partir de datos de Excel exportados de SAP, mostrando métricas en tiempo real de entregas, inventario y SKU para Walmart, Target y Amazon.",
  "xp.1.d2":
    "Desarrollé reportes drill-through desde el estilo de producto hasta el SKU individual, habilitando análisis granular de brechas de inventario y desempeño de entregas.",
  "xp.1.d3":
    "Identifiqué y resolví una discrepancia en la transmisión de datos entre FedEx, Intradeco y Walmart, eliminando un costoso error recurrente de conciliación.",
  "xp.1.d4":
    "Automaticé flujos semanales de reportes en Excel + Power BI, reduciendo el tiempo de preparación manual para los equipos comerciales.",
  "xp.2.role": "Coordinador de Aseguramiento de Calidad",
  "xp.2.when": "Ene a Jun 2021",
  "xp.2.d1":
    "Diseñé procedimientos de prueba y marcos de recolección de datos que redujeron la tasa de defectos en 18%.",
  "xp.2.d2":
    "Analicé métricas de calidad y comentarios de clientes para encontrar mejoras de proceso, aumentando la eficiencia en 12%.",
  "xp.3.role": "Representante de Servicio al Cliente",
  "xp.3.when": "Jun a Dic 2020",
  "xp.3.d1":
    "Resolví 40+ consultas diarias en múltiples canales con una satisfacción de 95%+.",
  "xp.3.d2":
    "Reporté patrones recurrentes de quejas a los equipos técnicos, reduciendo el volumen de soporte en 12%.",

  /* education */
  "edu.1.dates": "Prevista para mayo de 2027",
  "edu.1.degree": "Maestría en Ingeniería de Software (M.Eng)",
  "edu.1.detail":
    "Cursos: Machine Learning · Algoritmos · Estructuras de Datos · Sistemas Distribuidos · Bases de Datos · Ingeniería de Software",
  "edu.2.dates": "Diciembre de 2019",
  "edu.2.degree": "Ingeniería Industrial",

  /* skills */
  "skills.c1": "Analítica y BI",
  "skills.c1cap": "4 años · producción",
  "skills.c2": "Programación",
  "skills.c2cap": "autodidacta",
  "skills.c3": "Datos y ML",
  "skills.c3cap": "cursos + proyectos",
  "skills.c4": "Herramientas",
  "skills.c4cap": "conocimiento práctico",
  "lvl.advanced": "avanzado",
  "lvl.intermediate": "intermedio",
  "lvl.developing": "en desarrollo",
  "lvl.basic": "básico",
  "lvl.applied": "aplicado",
  "lvl.coursework": "cursos",
  "lvl.working": "práctico",

  /* contact + footer */
  "contact.big": "Hablemos →",
  "contact.resume": "CV.pdf ↓",
  "footer.compiled": "Compilado 07 / 2026",
  "a11y.totop": "Volver arriba",

  /* strings created by main.js at runtime */
  "js.loading": "cargando dataset",
  "js.close": "Cerrar",
};
