/**
 * L'ACADÉMIE DU DAMIER — apprendre les grands STYLES de parties.
 *
 * Cinq professeurs, cinq styles (le programme suit les cours et livrets
 * fédéraux FFJD/FMJD — livrets D. Thiney et J-P. Dubois « la stratégie
 * du blocage ») :
 *   celestin — LA PARTIE CLASSIQUE : partage du centre, enchaînement
 *              réciproque, la ligne du « dégagement classique » ;
 *   gaspard  — LE SYSTÈME GHESTEM : gagner de l'espace par l'avancée
 *              28-22 puis 33-28, bloquer les pions adverses ;
 *   salome   — LA PARTIE SEMI-OUVERTE : un seul camp tient le centre,
 *              l'autre l'ENCERCLE au lieu de l'attaquer de front ;
 *   tiphaine — LE TAQUIN : l'avant-poste en 24 qui cloue l'aile adverse ;
 *   boris    — LE MARCHAND DE BOIS : les formations de pionage (Y, croix,
 *              flèche, triplet) et le Y construit au bord du damier.
 *
 * Chaque leçon se joue sur le vrai moteur (format runExercise) : lignes
 * tirées des livrets ou positions CERTIFIÉES par recherche minimax
 * (tests/academy.test.mjs les rejoue à chaque npm test). Après la leçon,
 * le professeur propose une PARTIE D'APPLICATION dans la structure étudiée.
 */

export const STYLES = [
  // ------------------------------------------------------------ CLASSIQUE
  {
    id: 'classique',
    npc: 'celestin',
    icon: '🏛️',
    title: 'La partie classique',
    desc: 'Le style des origines : chacun tient le centre, les chaînes se font face.',
    reward: 60,
    steps: [
      {
        fen: 'W:W31-50:B1-20',
        intro: [
          { who: 'celestin', text: 'La PARTIE CLASSIQUE, c\'est le style des origines : les deux camps se partagent le centre et s\'y accrochent — un enchaînement réciproque. Les cases qui comptent : 27, 28, 29 pour toi… 22, 23, 24 pour lui.' },
          { who: 'celestin', text: 'Tout commence par LE coup d\'ouverture : avance ton pion vers la grande case centrale 28.' },
        ],
        accept: [{ from: 32, to: 28 }],
        reply: { from: 18, to: 22 },
        wrong: { who: 'celestin', text: 'Non. Le centre, jeune élève, le CENTRE. La case 28 est la porte d\'entrée de toute partie classique : 32-28.' },
        success: [
          { who: 'celestin', text: '32-28 ! Et voici la réponse des Noirs : 18-22, le début hollandais. Son pion 22 s\'avance au contact du tien — la partie de position commence.' },
        ],
        hint: { from: 32, to: 28 },
      },
      {
        intro: [
          { who: 'celestin', text: 'Règle d\'or : un pion de pointe ne vaut que par ses SOUTIENS. Développe ta colonne derrière le pion 28.' },
        ],
        accept: [{ from: 37, to: 32 }],
        reply: { from: 12, to: 18 },
        wrong: { who: 'celestin', text: 'Pense en COLONNES : quel coup vient épauler ton pion 28, dans son dos, sur la même diagonale ?' },
        success: [
          { who: 'celestin', text: '37-32 : la colonne 28-32 est née. Les Noirs font de même avec 12-18. Observe : chaque camp construit, personne ne se précipite. C\'est ça, la classique.' },
        ],
        hint: { from: 37, to: 32 },
      },
      {
        intro: [
          { who: 'celestin', text: 'Le pion noir 22 s\'est aventuré. Prends-le en TENAILLE : avance 32-27, il sera cerné des deux côtés.' },
        ],
        accept: [{ from: 32, to: 27 }],
        reply: { from: 19, to: 23 },
        wrong: { who: 'celestin', text: 'La tenaille ! Le pion 22 noir doit se retrouver coincé entre tes pions 27 et 28. Un seul coup fait cela.' },
        success: [
          { who: 'celestin', text: '32-27, la tenaille se referme sur le pion 22… Mais regarde la parade des Noirs : 19-23 ! C\'est le DÉGAGEMENT CLASSIQUE — leur colonne 10-14-19 leur permet d\'offrir l\'échange au bon moment.' },
        ],
        hint: { from: 32, to: 27 },
      },
      {
        intro: [
          { who: 'celestin', text: 'Le pion 23 noir s\'offre à ta prise… qui est obligatoire. Joue-la.' },
        ],
        accept: [{ from: 28, to: 19 }],
        reply: { from: 14, to: 23 },
        wrong: { who: 'celestin', text: 'La prise est obligatoire : ton pion 28 doit sauter le pion 23.' },
        success: [
          { who: 'celestin', text: '28x19, 14x23 — et voilà la PARTIE CLASSIQUE dans toute sa splendeur : ton pion 27 face au pion 23 noir, deux chaînes qui s\'observent.' },
          { who: 'celestin', text: 'Retiens les trois piliers du style : des COLONNES qui se soutiennent, des TEMPS que l\'on compte (celui qui doit céder le premier perd le centre), et une rangée arrière que l\'on ne dégarnit jamais trop tôt.' },
        ],
        hint: { from: 28, to: 19 },
      },
    ],
    practice: {
      fen: 'W:W27,31,33,34,35,36,38,39,40,41,42,43,44,45,46,47,48,49,50:B1,2,3,4,5,6,7,8,9,10,11,13,15,16,17,18,20,22,23',
      level: 'apprenti',
      label: 'Partie classique — position d\'école',
      reward: 80,
      invite: 'Assez de théorie : jouons cette position classique jusqu\'au bout. Tiens ton centre, compte tes temps !',
    },
  },

  // -------------------------------------------------------------- GHESTEM
  {
    id: 'ghestem',
    npc: 'gaspard',
    icon: '🧱',
    title: 'Le système Ghestem',
    desc: 'Gagner de l\'espace par l\'avancée 28-22, puis bloquer tout ce qui bouge.',
    reward: 60,
    steps: [
      {
        fen: 'W:W27,28,32,33,34,38,39,43,44,49:B3,4,8,9,13,14,18,19,20,23',
        intro: [
          { who: 'gaspard', text: 'Le système GHESTEM, du nom d\'un champion du monde français. L\'idée : GAGNER DE L\'ESPACE dans le camp adverse et étouffer, pion par pion. Comme le dit le maître Dubois : « l\'objectif stratégique, c\'est de bloquer TOUS les pions adverses ».' },
          { who: 'gaspard', text: 'L\'arme du système : l\'avancée 28-22. Ton pion 27 la protège — les Noirs ne pourront pas la prendre. Vas-y.' },
        ],
        accept: [{ from: 28, to: 22 }],
        reply: { from: 20, to: 24 },
        wrong: { who: 'gaspard', text: 'Non — L\'AVANCÉE. Ton pion 28 doit plonger en 22, dans leur camp. Regarde : ta case 27 est tenue, la prise 18x27 est impossible.' },
        success: [
          { who: 'gaspard', text: '28-22 ! Ton pion campe dans leurs lignes et leur aile gauche suffoque déjà. Ils cherchent de l\'air à droite avec 20-24…' },
        ],
        hint: { from: 28, to: 22 },
      },
      {
        intro: [
          { who: 'gaspard', text: 'L\'avancée Ghestem se joue en DEUX temps : 28-22 d\'abord… puis on réoccupe la case 28. Complète le dispositif.' },
        ],
        accept: [{ from: 33, to: 28 }],
        reply: { from: 8, to: 12 },
        wrong: { who: 'gaspard', text: 'La case 28 est vide, et c\'est un trou dans ton mur. Quelle pièce peut la reprendre immédiatement ?' },
        success: [
          { who: 'gaspard', text: '33-28 : le mur est reconstruit, 22 et 28 verrouillent tout le secteur. Les Noirs n\'ont plus que des coups d\'attente.' },
        ],
        hint: { from: 33, to: 28 },
      },
      {
        intro: [
          { who: 'gaspard', text: 'Dernier principe : chaque pion avancé doit avoir sa RELÈVE. Prépare l\'arrière-garde de ton aile droite.' },
        ],
        accept: [{ from: 44, to: 40 }],
        wrong: { who: 'gaspard', text: 'Pense à demain : quel pion de ta dernière ligne monte soutenir l\'aile droite sans rien affaiblir ?' },
        success: [
          { who: 'gaspard', text: '44-40. Regarde ta position : de l\'espace, des colonnes, des temps de réserve — et en face, des pions qui se marchent dessus. C\'est TOUT le système Ghestem : on ne se presse pas, on étouffe.' },
          { who: 'gaspard', text: 'Garde en tête la mise en garde du maître Dubois : quand c\'est TOI qui es enchaîné, rends ton jeu actif — un objectif précis, ou l\'asphyxie.' },
        ],
        hint: { from: 44, to: 40 },
      },
    ],
    practice: {
      fen: 'B:W22,27,28,32,34,38,39,40,43,49:B3,4,9,12,13,14,18,19,23,24',
      level: 'apprenti',
      label: 'Système Ghestem — l\'étau est posé',
      reward: 80,
      invite: 'À toi de jouer le dispositif Ghestem jusqu\'à la victoire. Ne relâche JAMAIS l\'étau.',
    },
  },

  // --------------------------------------------------------- SEMI-OUVERTE
  {
    id: 'semiouverte',
    npc: 'salome',
    icon: '🌗',
    title: 'La partie semi-ouverte',
    desc: 'Un seul camp tient le centre : l\'autre l\'encercle au lieu de l\'attaquer.',
    reward: 60,
    steps: [
      {
        // Position certifiée : après 34-29, le pion noir avancé 28 est cerné
        // et TOUTES les défenses perdent (re-vérifié par tests/academy.test.mjs).
        certified: true,
        fen: 'W:W34,36,37,38,39:B8,12,17,18,28',
        intro: [
          { who: 'salome', text: 'La partie SEMI-OUVERTE : un seul camp occupe le centre, l\'autre joue autour. Sa grande loi tient en un mot — ENCERCLEMENT. On n\'attaque pas un pion avancé de front… on l\'entoure, jusqu\'à ce qu\'il n\'ait plus une case.' },
          { who: 'salome', text: 'Regarde ce pion noir en 28, tout fier d\'être entré chez toi. Surtout, ne le brusque pas. Referme simplement la porte derrière lui.' },
        ],
        accept: [{ from: 34, to: 29 }],
        reply: { from: 28, to: 32 },
        wrong: { who: 'salome', text: 'Trop direct. L\'encerclement, c\'est la patience : quel coup retire au pion 28 sa dernière échappatoire, sans rien lui offrir à prendre ?' },
        success: [
          { who: 'salome', text: '34-29 — et la cage est fermée : 32, 33, 37, 38… toutes ses cases de fuite sont surveillées. Il panique et tente 28-32, la sortie du désespoir.' },
        ],
        hint: { from: 34, to: 29 },
      },
      {
        intro: [
          { who: 'salome', text: 'Il s\'est jeté dans la nasse. Referme-la — en reprenant vers le centre.' },
        ],
        accept: [{ from: 38, to: 27 }],
        wrong: { who: 'salome', text: 'Prends-le en gardant ta structure compacte : la prise qui referme la nasse vers l\'intérieur.' },
        success: [
          { who: 'salome', text: '38x27 : le pion prisonnier est ramassé, et ta position n\'a pas une ride. Voilà la semi-ouverte : celui qui tient le centre a l\'air d\'avoir l\'avantage… jusqu\'à ce que l\'encerclement le prouve du contraire.' },
          { who: 'salome', text: 'Retiens : face à un centre adverse, ne te précipite jamais. Contrôle les cases VOISINES, garde tes chaînes souples… et laisse son pion avancé devenir ton prisonnier.' },
        ],
        hint: { from: 38, to: 27 },
      },
    ],
    practice: {
      fen: 'W:W34,36,37,38,39:B8,12,17,18,28',
      level: 'club',
      label: 'Semi-ouverte — l\'art d\'encercler',
      reward: 80,
      invite: 'Rejouons cette position pour de vrai : encercle, ne te presse pas, et convertis ton avantage.',
    },
  },

  // --------------------------------------------------------------- TAQUIN
  {
    id: 'taquin',
    npc: 'tiphaine',
    icon: '😜',
    title: 'Le pion taquin',
    desc: 'Un avant-poste en 24 qui cloue l\'aile adverse… et mord quand on le chasse.',
    reward: 60,
    steps: [
      {
        fen: 'W:W29,30,33,34,39,40,44,45:B4,5,10,14,15,18,19,25',
        intro: [
          { who: 'tiphaine', text: 'Je te présente mon pion préféré : LE TAQUIN. Un pion qu\'on installe en 24, en plein dans leur aile — il ne fait rien de spécial… à part rendre la vie IMPOSSIBLE à tout son voisinage.' },
          { who: 'tiphaine', text: 'Regarde les pions noirs 15 et 25, collés au bord. Installe le taquin : ils ne bougeront plus. Et ton pion 30 le garde : la prise est impossible.' },
        ],
        accept: [{ from: 29, to: 24 }],
        reply: { from: 15, to: 20 },
        wrong: { who: 'tiphaine', text: 'La case 24, voyons ! L\'avant-poste doit venir SE COLLER à leur aile — bien gardé par ton pion 30.' },
        success: [
          { who: 'tiphaine', text: '29-24, le taquin est en place ! Le pion 25 noir est mort de chez mort (sa seule case, 30, est à toi). Et là… il craque : 15-20 ?! Il essaie de chasser le taquin. Grosse, GROSSE erreur.' },
        ],
        hint: { from: 29, to: 24 },
      },
      {
        intro: [
          { who: 'tiphaine', text: 'La prise est obligatoire — mais COMPTE bien avant de jouer : ton taquin a mieux à croquer que le petit pion 20. Cherche la prise MAJORITAIRE.' },
        ],
        accept: [{ from: 24, to: 22 }],
        wrong: { who: 'tiphaine', text: 'Compte encore ! Entre plusieurs prises, la loi du damier impose la plus LONGUE. Suis le zigzag de ton taquin vers la gauche…' },
        success: [
          { who: 'tiphaine', text: '24x22 : DEUX pions raflés (le 19 et le 18), et le sien reste planté en 20 ! Voilà tout l\'art du taquin : il cloue, il agace, et à la première imprudence… il mord.' },
          { who: 'tiphaine', text: 'Un dernier secret : un taquin sans gardes du corps (30, 34, 40) finit encerclé. Installe-le toujours SOUTENU — sinon c\'est lui qu\'on taquine.' },
        ],
        hint: { from: 24, to: 22 },
      },
    ],
    practice: {
      fen: 'W:W24,30,33,34,39,40,44,45:B4,5,10,14,15,18,23,25',
      level: 'club',
      label: 'Le taquin est en 24 — exploite-le',
      reward: 80,
      invite: 'Ton taquin est posé, leurs pions 15 et 25 sont cloués. Gagne la partie sans le lâcher !',
    },
  },

  // ----------------------------------------------- MARCHAND DE BOIS (formations)
  {
    id: 'bois',
    npc: 'boris',
    icon: '🪵',
    title: 'Le marchand de bois',
    desc: 'Les formations de pionage : le Y, la croix, la flèche… et le Y du bord.',
    reward: 60,
    steps: [
      {
        fen: 'W:W31-50:B1-20',
        intro: [
          { who: 'boris', text: 'Chez moi, on ne joue pas des coups : on monte des CHARPENTES. Les livrets fédéraux les appellent formations de pionage : le Y, la croix, la flèche, le triplet… Un pion seul ne vaut rien — une formation, elle, PORTE.' },
          { who: 'boris', text: 'Le pionage — donner un pion pour en reprendre un — c\'est la respiration du jeu : sans lui, tout se bouche. Commence par la plus belle des charpentes : avance 33-28 et regarde LA FLÈCHE se dessiner (28, soutenu par 32-33… enfin, par 38 et 39 chez toi).' },
        ],
        accept: [{ from: 33, to: 28 }],
        reply: { from: 19, to: 23 },
        wrong: { who: 'boris', text: 'Non non. La FLÈCHE se construit par 33-28 : la pointe au centre, les épaules derrière.' },
        success: [
          { who: 'boris', text: '33-28, la flèche est encochée ! Et en face : 19-23, ils proposent l\'échange. Bien — un charpentier n\'a jamais peur d\'échanger du bois.' },
        ],
        hint: { from: 33, to: 28 },
      },
      {
        intro: [
          { who: 'boris', text: 'Prise obligatoire : passe par-dessus.' },
        ],
        accept: [{ from: 28, to: 19 }],
        reply: { from: 14, to: 23 },
        wrong: { who: 'boris', text: 'La prise t\'attend : 28 saute 23.' },
        success: [
          { who: 'boris', text: '28x19, 14x23 : un pion donné, un pion repris — le PIONAGE. La position respire, et personne n\'a rien perdu. Maintenant, la leçon sérieuse : viens voir ce qui se passe quand le Y pousse AU BORD du damier…' },
        ],
        hint: { from: 28, to: 19 },
      },
      {
        // Position certifiée : 40-35 construit le Y du bord (le « marchand de
        // bois » du livret Thiney) et crée une menace imparable — TOUTES les
        // défenses noires perdent (re-vérifié par tests/academy.test.mjs).
        certified: true,
        fen: 'W:W24,29,30,40,45:B5,13,14,15,19',
        intro: [
          { who: 'boris', text: 'Fin de partie. Ton taquin est en 24 et ta réserve suit. Le Y construit sur un bord, les anciens l\'appellent LE MARCHAND DE BOIS : empile 24-30-35, et la menace 24-20 devient IMPARABLE. Monte la charpente.' },
        ],
        accept: [{ from: 40, to: 35 }],
        reply: { from: 13, to: 18 },
        wrong: { who: 'boris', text: 'Le bois s\'empile du bas vers le haut : quel coup complète la colonne du bord derrière tes pions 24 et 30 ?' },
        success: [
          { who: 'boris', text: '40-35 : le marchand de bois a fait sa pile — 24, 30, 35, et la 45 en réserve. Le moteur de la menace : 24-20 gagnerait un pion quoi qu\'ils fassent. Regarde-le paniquer : 13-18, il tente de se faire de la place…' },
        ],
        hint: { from: 40, to: 35 },
      },
      {
        intro: [
          { who: 'boris', text: 'Et voilà le bois qui tombe tout seul : prise majoritaire !' },
        ],
        accept: [{ from: 24, to: 22 }],
        wrong: { who: 'boris', text: 'Compte les troncs : ton taquin 24 peut sauter DEUX pions d\'un coup. La prise majoritaire est obligatoire.' },
        success: [
          { who: 'boris', text: '24x22, deux pions dans la remorque ! Morale du marchand de bois : de bonnes FORMATIONS, une menace simple… et l\'adversaire scie lui-même la branche où il est assis.' },
        ],
        hint: { from: 24, to: 22 },
      },
    ],
    practice: {
      fen: 'W:W24,29,30,40,45:B5,13,14,15,19',
      level: 'club',
      label: 'Marchand de bois — trouve 40-35 en partie',
      reward: 80,
      invite: 'Rejouons cette fin de partie POUR DE VRAI cette fois : à toi de retrouver la bonne charpente et de conclure.',
    },
  },

  // -------------------------------------------------------------- FINALES
  // Le cours d'Hortense suit le plan des traités de fins de partie
  // (méthode « Allons à dame » de J-F. Latapie) : pions contre pions
  // (l'offre + la double opposition), puis dame contre deux pions
  // (le blocage angulaire). Chaque ligne est re-certifiée par le moteur.
  {
    id: 'finales',
    npc: 'hortense',
    icon: '🏁',
    title: 'L\'école des finales',
    desc: 'Là où les parties se gagnent : l\'offre, la double opposition, le blocage angulaire.',
    reward: 70,
    steps: [
      {
        fen: 'W:W28,35,43:B14,18',
        intro: [
          { who: 'hortense', text: 'Assieds-toi, mon petit. Tout le monde veut apprendre les combinaisons… mais les parties, elles, se gagnent EN FINALE. Trois pions contre deux — et pourtant, si tu joues « naturellement », les Noirs passent à dame.' },
          { who: 'hortense', text: 'Premier secret des finales : on ne compte pas les pions, on compte les CASES et les TEMPS. Commence par avancer ton pion libre — celui qui ne défend rien.' },
        ],
        accept: [{ from: 35, to: 30 }],
        reply: { from: 14, to: 19 },
        wrong: { who: 'hortense', text: 'Doucement. Regarde tes trois pions : lequel peut avancer sans rien affaiblir ? C\'est toujours par lui qu\'on commence.' },
        success: [
          { who: 'hortense', text: '35-30, très bien. Les Noirs avancent 14-19, droit vers la dame… C\'est maintenant que la magie opère.' },
        ],
        hint: { from: 35, to: 30 },
      },
      {
        intro: [
          { who: 'hortense', text: 'Deuxième secret : L\'OFFRE. On donne un pion — pas par générosité : pour que la prise obligatoire amène son pion EXACTEMENT où nous voulons. Offre.' },
        ],
        accept: [{ from: 30, to: 24 }],
        reply: { from: 19, to: 30 },
        wrong: { who: 'hortense', text: 'Non — il faut OFFRIR. Mets ton pion en prise, de façon que la capture noire l\'éloigne de la promotion.' },
        success: [
          { who: 'hortense', text: '30-24 ! Ils doivent prendre : 19x30 — et voilà leur pion de course expédié sur le bord du damier. Un pion donné, un plan gagné.' },
        ],
        hint: { from: 30, to: 24 },
      },
      {
        intro: [
          { who: 'hortense', text: 'Troisième secret : LA DOUBLE OPPOSITION. Place tes deux pions face aux deux siens — à distance impaire — et il ne pourra plus jamais avancer sans se faire prendre.' },
        ],
        accept: [{ from: 43, to: 39 }],
        reply: { from: 30, to: 35 },
        wrong: { who: 'hortense', text: 'Cherche l\'OPPOSITION : ton pion arrière doit venir se placer face au pion noir qui vient de prendre.' },
        success: [
          { who: 'hortense', text: '43-39. Il fuit en 35… mais la porte se referme.' },
        ],
        hint: { from: 43, to: 39 },
      },
      {
        intro: [
          { who: 'hortense', text: 'Scelle la double opposition.' },
        ],
        accept: [{ from: 39, to: 34 }],
        wrong: { who: 'hortense', text: 'Face à lui, à une case d\'écart : c\'est ça, l\'opposition.' },
        success: [
          { who: 'hortense', text: '39-34 : double opposition ! Ses deux pions sont paralysés — chaque avance se fait prendre. Il devra les donner l\'un après l\'autre. Voilà comment trois pions bien élevés en battent deux.' },
        ],
        hint: { from: 39, to: 34 },
      },
      {
        fen: 'W:WK23:B11,20',
        intro: [
          { who: 'hortense', text: 'Deuxième leçon, la plus célèbre de toutes : DAME CONTRE DEUX PIONS. Beaucoup croient que la dame gagne toute seule… Non. Sans méthode, les pions passent. La méthode s\'appelle LE BLOCAGE ANGULAIRE.' },
          { who: 'hortense', text: 'Le principe : conduire ta dame dans le COIN vers lequel courent les deux pions — case 48 ou 49 — et les y attendre. Commence : recule ta dame sur la diagonale, sans jamais perdre les pions de vue.' },
        ],
        accept: [{ from: 23, to: 29 }],
        reply: { from: 20, to: 25 },
        wrong: { who: 'hortense', text: 'Ta dame doit reculer VERS le coin 48-49, d\'une case, en gardant les deux pions sous surveillance. Pas de précipitation.' },
        success: [
          { who: 'hortense', text: '23-29. Eux avancent, 20-25 — laisse-les venir : plus ils avancent, plus le coin se rapproche.' },
        ],
        hint: { from: 23, to: 29 },
      },
      {
        intro: [{ who: 'hortense', text: 'Continue la retraite calculée : case par case.' }],
        accept: [{ from: 29, to: 34 }],
        reply: { from: 11, to: 17 },
        wrong: { who: 'hortense', text: 'Toujours la même diagonale, toujours une case vers le coin.' },
        success: [{ who: 'hortense', text: '29-34. L\'autre pion s\'ébranle : 11-17. Aucune importance — le rendez-vous est déjà pris, case 48.' }],
        hint: { from: 29, to: 34 },
      },
      {
        intro: [{ who: 'hortense', text: 'Encore.' }],
        accept: [{ from: 34, to: 39 }],
        reply: { from: 17, to: 21 },
        wrong: { who: 'hortense', text: 'La diagonale, mon petit, la diagonale du coin.' },
        success: [{ who: 'hortense', text: '34-39, 17-21. Regarde-les se rapprocher l\'un de l\'autre : ils croient marcher vers la dame… ils marchent vers leur cage.' }],
        hint: { from: 34, to: 39 },
      },
      {
        intro: [{ who: 'hortense', text: 'L\'avant-dernier pas.' }],
        accept: [{ from: 39, to: 43 }],
        reply: { from: 21, to: 26 },
        wrong: { who: 'hortense', text: 'Un pas de plus vers le coin — un seul.' },
        success: [{ who: 'hortense', text: '39-43, et 21-26. Les deux pions sont côte à côte, aux portes de la dernière rangée. C\'est exactement là qu\'on les voulait.' }],
        hint: { from: 39, to: 43 },
      },
      {
        intro: [{ who: 'hortense', text: 'Et maintenant… ferme la cage.' }],
        accept: [{ from: 43, to: 48 }],
        wrong: { who: 'hortense', text: 'LE COIN. La case 48. C\'est le verrou du blocage angulaire.' },
        success: [
          { who: 'hortense', text: '43-48 : BLOCAGE ANGULAIRE. Contemple : 25 et 26 ne peuvent plus avancer qu\'en se jetant sous ta dame. Ils devront se sacrifier l\'un après l\'autre — et le dernier n\'atteindra jamais sa couronne.' },
          { who: 'hortense', text: 'Retiens mes trois secrets : les TEMPS avant les pions, l\'OFFRE qui déplace, et le COIN qui attend. Avec ça, mon petit, tu ne trembleras plus jamais en finale.' },
        ],
        hint: { from: 43, to: 48 },
      },
    ],
    practice: {
      fen: 'W:W23,24,36,37,38,42:B13,14,16,21,26,27',
      level: 'club',
      label: 'Finale de maîtres — 6 pions contre 6',
      reward: 90,
      invite: 'Cette finale est tirée d\'une vraie partie de championnat. Compte tes temps, prépare ton offre… et va chercher la double opposition.',
    },
  },
];

// ---------------------------------------------------------------------------
// L'ANNEXE DES MAÎTRES — réservée aux diplômés de l'Académie.
// Deux systèmes de haut niveau, d'après les ouvrages interactifs de
// Jean-Pierre Dubois (champion de France 1982) diffusés par « Allons à
// dame » : le système Roozenburg et le système Keller. Lignes re-certifiées.
// ---------------------------------------------------------------------------
export const MASTER_STYLES = [
  {
    id: 'roozenburg',
    npc: 'piet',
    icon: '🌷',
    title: 'Le système Roozenburg',
    desc: 'L\'attaque du centre : un taquin épaulé, puis la pression sur le pion isolé.',
    reward: 90,
    steps: [
      {
        fen: 'W:W29,30,31,32,33,34,35,36,37,38,39,42,44,48:B2,4,7,8,9,12,13,15,16,17,18,19,23,25',
        intro: [
          { who: 'piet', text: 'Piet Roozenburg, champion du monde de 1948 à 1956, a donné son nom au plus célèbre des systèmes d\'attaque : on ne prend pas le centre… on l\'ASSIÈGE. D\'abord un pion taquin épaulé, ensuite la pression sur le pion central isolé.' },
          { who: 'piet', text: 'Regarde le pion noir 23 : c\'est lui, la cible. Première étape : installe le taquin par l\'échange — offre en 24.' },
        ],
        accept: [{ from: 30, to: 24 }],
        reply: { from: 19, to: 30 },
        wrong: { who: 'piet', text: 'Le système commence toujours par l\'ÉCHANGE d\'installation : quel coup offre un pion en 24, la case du taquin ?' },
        success: [
          { who: 'piet', text: '30-24 ! La prise 19x30 est obligatoire… et elle dégage la colonne du pion 23 : le voilà seul au centre.' },
        ],
        hint: { from: 30, to: 24 },
      },
      {
        intro: [
          { who: 'piet', text: 'Reprends — et installe.' },
        ],
        accept: [{ from: 35, to: 24 }],
        wrong: { who: 'piet', text: 'La reprise est obligatoire : ton pion 35 ramasse le pion 30.' },
        success: [
          { who: 'piet', text: '35x24 : le taquin est en place, ÉPAULÉ par le pion 29 — jamais de taquin sans épaule ! Et la menace de fond est née : l\'attaque du pion central 23.' },
        ],
        hint: { from: 35, to: 24 },
      },
      {
        // Et si les Noirs tentent d'interdire l'attaque par 17-22 ? La
        // formation de pionnage 33-39-44 punit immédiatement (certifié +163).
        fen: 'W:W24,29,31,32,33,34,36,37,38,39,42,44,48:B2,4,7,8,9,12,13,15,16,18,22,23,25',
        intro: [
          { who: 'piet', text: 'Question piège : les Noirs viennent de jouer 17-22, pour interdire ton attaque en occupant la case 22. Ont-ils raison ?… Non. Et c\'est ta formation de pionnage 33-39-44 qui va le prouver. Frappe.' },
        ],
        accept: [{ from: 33, to: 28 }],
        reply: { from: 22, to: 33 },
        wrong: { who: 'piet', text: 'Cherche le coup qui met le pion 22 en PRISE OBLIGATOIRE… et prépare une reprise gagnante grâce à la colonne 39-44 derrière.' },
        success: [
          { who: 'piet', text: '33-28 ! Ils doivent prendre : 22x33…' },
        ],
        hint: { from: 33, to: 28 },
      },
      {
        intro: [
          { who: 'piet', text: 'Et maintenant, la récolte.' },
        ],
        accept: [{ from: 39, to: 19 }],
        wrong: { who: 'piet', text: 'La rafle majoritaire t\'attend : suis le chemin de ton pion 39.' },
        success: [
          { who: 'piet', text: '39x19 : deux pions repris, un pion de gain net. Retiens la mécanique Roozenburg : taquin ÉPAULÉ, pion central ISOLÉ, et une formation de pionnage prête à punir toute défense hâtive.' },
        ],
        hint: { from: 39, to: 19 },
      },
    ],
    practice: {
      fen: 'B:W24,29,31,32,33,34,36,37,38,39,42,44,48:B2,4,7,8,9,12,13,15,16,17,18,23,25',
      level: 'regional',
      label: 'Système Roozenburg — le siège du centre',
      reward: 110,
      invite: 'Le taquin est installé, le pion 23 est isolé. Joue le siège jusqu\'au bout — sans jamais lâcher la pression.',
    },
  },
  {
    id: 'keller',
    npc: 'sacha',
    icon: '❄️',
    title: 'Le système Keller',
    desc: 'L\'engagement total dès l\'ouverture : la variante Chizhov, coup par coup.',
    reward: 90,
    steps: [
      {
        fen: 'W:W31-50:B1-20',
        intro: [
          { who: 'sacha', text: 'Le système Keller : la forme de jeu où l\'engagement est TOTAL dès les premiers coups. On va rejouer la ligne d\'une partie de championnat du monde (Boomstra–Ivanov, 2013) — la variante que le grand Alexis Chizhov a rendue célèbre.' },
          { who: 'sacha', text: 'Tout commence par le coup de flanc : 33-29, la signature du Keller.' },
        ],
        accept: [{ from: 33, to: 29 }],
        reply: { from: 17, to: 22 },
        wrong: { who: 'sacha', text: 'La signature du système : le pion 33 monte en 29, sur le flanc. Rien d\'autre.' },
        success: [{ who: 'sacha', text: '33-29 — et 17-22 en face : les Noirs prennent date au centre. Laisse-les faire : le Keller se joue en colonne.' }],
        hint: { from: 33, to: 29 },
      },
      {
        intro: [{ who: 'sacha', text: 'Reforme la colonne derrière ton pion de pointe.' }],
        accept: [{ from: 39, to: 33 }],
        reply: { from: 11, to: 17 },
        wrong: { who: 'sacha', text: 'La case 33 vient de se vider : qui la reprend ?' },
        success: [{ who: 'sacha', text: '39-33. Eux consolident : 11-17. Chacun bâtit son armée — la tension monte.' }],
        hint: { from: 39, to: 33 },
      },
      {
        intro: [{ who: 'sacha', text: 'Encore la colonne.' }],
        accept: [{ from: 44, to: 39 }],
        reply: { from: 6, to: 11 },
        wrong: { who: 'sacha', text: 'Toujours la même diagonale : 44 relaie 39.' },
        success: [{ who: 'sacha', text: '44-39, 6-11. Remarque : pas un échange depuis le début. Le Keller accumule la tension… pour la libérer d\'un coup.' }],
        hint: { from: 44, to: 39 },
      },
      {
        intro: [{ who: 'sacha', text: 'Complète l\'arrière-garde.' }],
        accept: [{ from: 50, to: 44 }],
        reply: { from: 1, to: 6 },
        wrong: { who: 'sacha', text: 'Le pion 50 monte : c\'est le dernier maillon de ta grande colonne.' },
        success: [{ who: 'sacha', text: '50-44 — la colonne 29-33-39-44 est complète. La plus belle charpente du jeu de dames, si tu veux mon avis.' }],
        hint: { from: 50, to: 44 },
      },
      {
        intro: [{ who: 'sacha', text: 'Un coup de flanc préparatoire : gêne son aile gauche.' }],
        accept: [{ from: 31, to: 26 }],
        reply: { from: 16, to: 21 },
        wrong: { who: 'sacha', text: 'Sur l\'AILE : le pion 31 vient tenir la case 26, face à leur pion de bande.' },
        success: [{ who: 'sacha', text: '31-26, 16-21. Tout est en place… C\'est ici que Chizhov dégainait. Prêt pour le feu d\'artifice ?' }],
        hint: { from: 31, to: 26 },
      },
      {
        intro: [
          { who: 'sacha', text: 'LA VARIANTE CHIZHOV : 29-24 ! On offre — et le damier explose en échanges. Joue, et suis bien chaque reprise.' },
        ],
        accept: [{ from: 29, to: 24 }],
        reply: { from: 19, to: 30 },
        wrong: { who: 'sacha', text: 'Le coup d\'engagement : ton pion de pointe 29 plonge en 24, EN PRISE. C\'est voulu.' },
        success: [{ who: 'sacha', text: '29-24 ! 19x30 — première étincelle.' }],
        hint: { from: 29, to: 24 },
      },
      {
        intro: [{ who: 'sacha', text: 'Reprends.' }],
        accept: [{ from: 35, to: 24 }],
        reply: { from: 20, to: 29 },
        wrong: { who: 'sacha', text: '35 ramasse 30.' },
        success: [{ who: 'sacha', text: '35x24, 20x29 : ils répliquent au centre…' }],
        hint: { from: 35, to: 24 },
      },
      {
        intro: [{ who: 'sacha', text: 'Continue la séquence — chaque prise est obligatoire.' }],
        accept: [{ from: 34, to: 23 }],
        reply: { from: 18, to: 29 },
        wrong: { who: 'sacha', text: '34 saute 29.' },
        success: [{ who: 'sacha', text: '34x23, 18x29…' }],
        hint: { from: 34, to: 23 },
      },
      {
        intro: [{ who: 'sacha', text: 'Le point final de la séquence.' }],
        accept: [{ from: 33, to: 24 }],
        wrong: { who: 'sacha', text: 'Ton pion 33 conclut la valse : il saute 29.' },
        success: [
          { who: 'sacha', text: '33x24 — la poussière retombe : quatre échanges, et TON pion trône en 24 face à leur aile engagée en 21-22. C\'est la structure Keller-Chizhov : matériel égal, mais un avant-poste, des colonnes… et toutes les combinaisons à venir sont pour toi.' },
        ],
        hint: { from: 33, to: 24 },
      },
    ],
    practice: {
      fen: 'B:W24,26,32,36,37,38,39,40,41,42,43,44,45,46,47,48,49:B2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,21,22',
      level: 'regional',
      label: 'Structure Keller-Chizhov — à toi de jouer',
      reward: 110,
      invite: 'La structure de championnat du monde est sur le damier. Exploite ton avant-poste 24 — et gare aux contre-combinaisons.',
    },
  },
];

export const ACADEMY_GRADUATE_BONUS = 250;

export function styleById(id) {
  return STYLES.find((s) => s.id === id) || MASTER_STYLES.find((s) => s.id === id);
}

export function styleByNpc(npcId) {
  return STYLES.find((s) => s.npc === npcId) || MASTER_STYLES.find((s) => s.npc === npcId);
}

export function styleDone(state, id) {
  return !!state.training?.styles?.done?.[id];
}

export function stylePracticeWon(state, id) {
  return !!state.training?.styles?.applied?.[id];
}

export function stylesCompleted(state) {
  return STYLES.filter((s) => styleDone(state, s.id)).length;
}

export function isAcademyGraduate(state) {
  return stylesCompleted(state) >= STYLES.length;
}
