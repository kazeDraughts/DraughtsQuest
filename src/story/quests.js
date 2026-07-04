/**
 * Scénario et dialogues des PNJ, pilotés par les drapeaux d'avancement
 * (state.story.flags). Version initiale : dialogues d'ambiance et partie
 * amicale chez Papi Marcel — la trame complète (intro, tutoriel, défi,
 * compétitions) arrive avec les phases suivantes.
 *
 * getNpcDialogue(npcId, ctx) -> { lines, onDone(answer) }
 * ctx : { flag, setFlag, startMatch(cfg), openShop(), openCompetitions() }
 */

export function getNpcDialogue(npcId, ctx) {
  switch (npcId) {
    case 'mom':
      return {
        lines: [
          { who: 'mom', text: 'Alors mon grand, cette balade ? Tu devrais passer voir Papi Marcel, il a toujours des histoires à raconter.' },
        ],
      };

    case 'grandpa':
      return {
        lines: [
          { who: 'grandpa', text: 'Ah, Tim ! Tu tombes bien. Je dépoussiérais justement mon vieux damier…' },
          {
            who: 'grandpa',
            text: 'Une petite partie amicale, ça te dit ?',
            choices: [
              { label: 'Avec plaisir !', value: 'play' },
              { label: 'Une autre fois.', value: 'later' },
            ],
          },
        ],
        onDone: (answer) => {
          if (answer === 'play') {
            ctx.startMatch({
              opponent: 'grandpa',
              level: 'debutant',
              intro: 'Partie amicale contre Papi Marcel',
            });
          }
        },
      };

    case 'gigi':
      return {
        lines: [
          { who: 'gigi', text: 'Bienvenue au club, gamin. On m\'appelle Gigi. Ici, on respire, on réfléchit… et on rafle.' },
        ],
      };

    case 'momo':
      return { lines: [{ who: 'momo', text: 'Chut… je calcule une rafle de quatre. Ou de trois. Bon, de deux.' }] };
    case 'lea':
      return { lines: [{ who: 'lea', text: 'Ici, la règle d\'or : quand tu peux prendre, tu DOIS prendre. Et le plus possible !' }] };
    case 'karim':
      return { lines: [{ who: 'karim', text: 'Un jour, je battrai Gigi. Enfin… un jour.' }] };
    case 'arbiter':
      return { lines: [{ who: 'arbiter', text: 'Règlement FMJD, article 4.4 : la prise majoritaire est obligatoire. Je dis ça, je dis rien.' }] };
    case 'shopkeeper':
      return { lines: [{ who: 'shopkeeper', text: 'Bienvenue dans ma boutique ! Les étagères se remplissent bientôt, repasse me voir.' }] };

    case 'villager1':
      return { lines: [{ who: 'villager1', text: 'La ville d\'Otterlaws est au nord. Leur club de dames est réputé dans toute la région !' }] };
    case 'villager2':
      return { lines: [{ who: 'villager2', text: 'On raconte que le grand maître Gigi a été vice-champion du monde, dans le temps.' }] };

    default:
      return { lines: [{ who: npcId, text: 'Bonjour !' }] };
  }
}
