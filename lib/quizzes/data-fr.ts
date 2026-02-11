import { Quiz } from './types';

export const quizzesFr: Quiz[] = [
  // A1 Level
  {
    id: 'a1-fr-basics-mc',
    title: 'Salutations de base',
    description: 'Testez vos connaissances sur les salutations courantes en francais.',
    level: 'A1',
    type: 'multiple-choice',
    image: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    targetLanguage: 'fr',
    questions: [
      {
        id: 'q1',
        question: 'Comment dit-on "Bom dia"?',
        options: ['Bonne après-midi', 'Bonjour', 'Bonne nuit', 'Salut'],
        correctAnswer: 'Bonjour'
      },
      {
        id: 'q2',
        question: 'Which phrase means "Eu sou..."?',
        options: ['Je suis...', 'Comment ça va?', 'Ca va?', 'Je m\'appelle...'],
        correctAnswer: 'Je suis...'
      }
    ]
  },
  {
    id: 'a1-fr-numbers-mc',
    title: 'Nombres de 1 a 10',
    description: 'Apprenez a compter en francais.',
    level: 'A1',
    type: 'multiple-choice',
    image: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    targetLanguage: 'fr',
    questions: [
      {
        id: 'q1',
        question: 'What is "Um"?',
        options: ['Un', 'Deux', 'Trois', 'Quatre'],
        correctAnswer: 'Un'
      },
      {
        id: 'q2',
        question: 'What is "Cinco"?',
        options: ['Quatre', 'Cinq', 'Six', 'Sept'],
        correctAnswer: 'Cinq'
      }
    ]
  },
  {
    id: 'a1-fr-colors-gap',
    title: 'Couleurs',
    description: 'Identifiez les couleurs en francais.',
    level: 'A1',
    type: 'fill-gap',
    image: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    targetLanguage: 'fr',
    questions: [
      {
        id: 'g1',
        question: 'The sky is _____ (azul).',
        parts: ['Le ciel est ', '.'],
        correctAnswers: ['bleu']
      },
      {
        id: 'g2',
        question: 'The apple is _____ (vermelha).',
        parts: ['La pomme est ', '.'],
        correctAnswers: ['rouge']
      }
    ]
  },
   {
    id: 'a1-fr-days-mc',
    title: 'Jours de la semaine',
    description: 'Apprenez les jours de la semaine en francais.',
    level: 'A1',
    type: 'multiple-choice',
    image: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
    targetLanguage: 'fr',
    questions: [
      {
        id: 'q1',
        question: 'What is "Segunda-feira"?',
        options: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi'],
        correctAnswer: 'Lundi'
      },
      {
        id: 'q2',
        question: 'What is "Sexta-feira"?',
        options: ['Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
        correctAnswer: 'Vendredi'
      }
    ]
  },

  // A2 Level
  {
    id: 'a2-fr-routine-gap',
    title: 'Routine quotidienne',
    description: 'Completez les phrases avec des actions du quotidien.',
    level: 'A2',
    type: 'fill-gap',
    image: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    targetLanguage: 'fr',
    questions: [
      {
        id: 'g1',
        question: 'Complete the sentence.',
        parts: ['Je me ', ' à 7 heures.'],
        correctAnswers: ['réveille']
      },
      {
        id: 'g2',
        question: 'Complete the sentence.',
        parts: ['Elle ', ' le petit déjeuner.'],
        correctAnswers: ['prend']
      }
    ]
  },
  {
    id: 'a2-fr-food-mc',
    title: 'Nourriture et boissons',
    description: 'Vocabulaire pour commander au restaurant.',
    level: 'A2',
    type: 'multiple-choice',
    image: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    targetLanguage: 'fr',
    questions: [
      {
        id: 'q1',
        question: 'What is "Frango"?',
        options: ['Boeuf', 'Poisson', 'Poulet', 'Porc'],
        correctAnswer: 'Poulet'
      },
      {
        id: 'q2',
        question: 'How do you ask for the bill?',
        options: ['L\'addition, s\'il vous plaît', 'Le menu, s\'il vous plaît', 'Où sont les toilettes?', 'Encore un'],
        correctAnswer: 'L\'addition, s\'il vous plaît'
      }
    ]
  },
  {
    id: 'a2-fr-transport-gap',
    title: 'Transports',
    description: 'Expressions utiles pour se deplacer en ville.',
    level: 'A2',
    type: 'fill-gap',
    image: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    targetLanguage: 'fr',
    questions: [
      {
        id: 'g1',
        question: 'Je prends le bus.',
        parts: ['Je prends le ', '.'],
        correctAnswers: ['bus']
      },
      {
        id: 'g2',
        question: 'Where is the subway station?',
        parts: ['Où est la station de ', '?'],
        correctAnswers: ['métro']
      }
    ]
  },
  {
    id: 'a2-fr-clothes-mc',
    title: 'Vetements',
    description: 'Vocabulaire des vetements et accessoires.',
    level: 'A2',
    type: 'multiple-choice',
    image: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    targetLanguage: 'fr',
    questions: [
      {
        id: 'q1',
        question: 'What is "Camisa"?',
        options: ['Chemise', 'Pantalon', 'Chaussures', 'Chapeau'],
        correctAnswer: 'Chemise'
      },
      {
        id: 'q2',
        question: 'What are "Sapatos"?',
        options: ['Chaussettes', 'Chaussures', 'Gants', 'Écharpe'],
        correctAnswer: 'Chaussures'
      }
    ]
  },

  // B1 Level
  {
    id: 'b1-fr-verbs-gap',
    title: 'Verbes au passe',
    description: 'Conjuguez des verbes au passe.',
    level: 'B1',
    type: 'fill-gap',
    image: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
    targetLanguage: 'fr',
    questions: [
      {
        id: 'g1',
        question: 'Yesterday, we _____ (go) to the cinema.',
        parts: ['Hier, nous sommes ', ' au cinéma.'],
        correctAnswers: ['allés']
      },
      {
        id: 'g2',
        question: 'They _____ (eat) pizza.',
        parts: ['Ils ont ', ' de la pizza.'],
        correctAnswers: ['mangé']
      }
    ]
  },
  {
    id: 'b1-fr-travel-mc',
    title: 'Vocabulaire du voyage',
    description: 'Mots et expressions utiles pour voyager.',
    level: 'B1',
    type: 'multiple-choice',
    image: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    targetLanguage: 'fr',
    questions: [
      {
        id: 'q1',
        question: 'What is "Bagagem"?',
        options: ['Billet', 'Bagage', 'Passeport', 'Aéroport'],
        correctAnswer: 'Bagage'
      },
      {
        id: 'q2',
        question: 'Translate "Alfândega".',
        options: ['Douane', 'Frontière', 'Police', 'Sécurité'],
        correctAnswer: 'Douane'
      }
    ]
  },
  {
    id: 'b1-fr-future-gap',
    title: 'Temps futur',
    description: 'Parlez d actions et de projets futurs.',
    level: 'B1',
    type: 'fill-gap',
    image: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    targetLanguage: 'fr',
    questions: [
      {
        id: 'g1',
        question: 'Tomorrow I _____ (travel).',
        parts: ['Demain je ', '.'],
        correctAnswers: ['voyagerai']
      },
      {
        id: 'g2',
        question: 'They _____ (arrive) late.',
        parts: ['Ils ', ' en retard.'],
        correctAnswers: ['arriveront']
      }
    ]
  },
  {
    id: 'b1-fr-health-mc',
    title: 'Sante et corps',
    description: 'Expressions pour parler de sante et du corps.',
    level: 'B1',
    type: 'multiple-choice',
    image: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    targetLanguage: 'fr',
    questions: [
      {
        id: 'q1',
        question: 'What is "Dor de cabeça"?',
        options: ['Mal de dos', 'Mal de tête', 'Mal de ventre', 'Mal de dents'],
        correctAnswer: 'Mal de tête'
      },
      {
        id: 'q2',
        question: 'Translate "Médico".',
        options: ['Infirmière', 'Médecin', 'Patient', 'Hôpital'],
        correctAnswer: 'Médecin'
      }
    ]
  },

  // B2 Level
  {
    id: 'b2-fr-idioms-mc',
    title: 'Expressions idiomatiques',
    description: 'Apprenez des expressions frequentes en francais.',
    level: 'B2',
    type: 'multiple-choice',
    image: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    targetLanguage: 'fr',
    questions: [
      {
        id: 'q1',
        question: 'What does "Avoir le cafard" mean?',
        options: ['To have a cockroach', 'To be depressed', 'To be hungry', 'To be angry'],
        correctAnswer: 'To be depressed'
      },
      {
        id: 'q2',
        question: 'Meaning of "Poser un lapin"?',
        options: ['To cook a rabbit', 'To stand someone up', 'To drop a rabbit', 'To adopt a pet'],
        correctAnswer: 'To stand someone up'
      }
    ]
  },
  {
    id: 'b2-fr-environment-gap',
    title: 'Environnement et nature',
    description: 'Vocabulaire pour parler des questions environnementales.',
    level: 'B2',
    type: 'fill-gap',
    image: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    targetLanguage: 'fr',
    questions: [
      {
        id: 'g1',
        question: 'Global ______ is a big problem.',
        parts: ['Le réchauffement ', ' est un grand problème.'],
        correctAnswers: ['climatique']
      },
      {
        id: 'g2',
        question: 'We must ______ nature.',
        parts: ['Nous devons ', ' la nature.'],
        correctAnswers: ['préserver']
      }
    ]
  },
  {
    id: 'b2-fr-politics-mc',
    title: 'Politique et societe',
    description: 'Vocabulaire lie a la politique et a la societe.',
    level: 'B2',
    type: 'multiple-choice',
    image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    targetLanguage: 'fr',
    questions: [
      {
        id: 'q1',
        question: 'What is "Eleição"?',
        options: ['Sélection', 'Élection', 'Collection', 'Correction'],
        correctAnswer: 'Élection'
      },
      {
        id: 'q2',
        question: 'Translate "Governo".',
        options: ['Gouverneur', 'Gouvernement', 'Gouvernance', 'Guide'],
        correctAnswer: 'Gouvernement'
      }
    ]
  },
  {
    id: 'b2-fr-technology-gap',
    title: 'Technologie',
    description: 'Vocabulaire utile dans les contextes technologiques.',
    level: 'B2',
    type: 'fill-gap',
    image: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
    targetLanguage: 'fr',
    questions: [
      {
        id: 'g1',
        question: 'I need to download the file.',
        parts: ['Je dois ', ' le fichier.'],
        correctAnswers: ['télécharger']
      },
      {
        id: 'g2',
        question: 'The wifi is slow.',
        parts: ['Le wifi est ', '.'],
        correctAnswers: ['lent']
      }
    ]
  },

    // C1/C2 Level
    {
        id: 'c1-fr-literature-mc',
        title: 'Analyse litteraire',
        description: 'Explorez plus en profondeur la litterature francaise classique.',
        level: 'C1',
        type: 'multiple-choice',
        image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        targetLanguage: 'fr',
        questions: [
            {
                id: 'q1',
                question: 'Who wrote "Les Misérables"?',
                options: ['Victor Hugo', 'Molière', 'Albert Camus', 'Voltaire'],
                correctAnswer: 'Victor Hugo'
            },
            {
                id: 'q2',
                question: 'What is the main theme of "L\'Étranger"?',
                options: ['Cooking', 'Absurdity', 'Romantic love', 'Nature'],
                correctAnswer: 'Absurdity'
            }
        ]
    },
    {
        id: 'c1-fr-subjunctive-gap',
        title: 'Grammaire avancee',
        description: 'Usages plus avances du subjonctif.',
        level: 'C1',
        type: 'fill-gap',
        image: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
        targetLanguage: 'fr',
        questions: [
            {
                id: 'g1',
                question: 'Il faut que tu _____ (aller).',
                parts: ['Il faut que tu ', '.'],
                correctAnswers: ['ailles']
            },
            {
                id: 'g2',
                question: 'Bien qu\'il _____ (être) malade.',
                parts: ['Bien qu\'il ', ' malade.'],
                correctAnswers: ['soit']
            }
        ]
    },
    {
        id: 'c1-fr-business-mc',
        title: 'Francais des affaires',
        description: 'Vocabulaire du monde professionnel et de l entreprise.',
        level: 'C1',
        type: 'multiple-choice',
        image: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
        targetLanguage: 'fr',
        questions: [
            {
                id: 'q1',
                question: 'What is "Lucro"?',
                options: ['Perte', 'Profit', 'Chance', 'Serrure'],
                correctAnswer: 'Profit'
            },
            {
                id: 'q2',
                question: 'Translate "Investimento".',
                options: ['Enquête', 'Investissement', 'Invention', 'Invitation'],
                correctAnswer: 'Investissement'
            }
        ]
    },
    {
        id: 'c1-fr-academic-gap',
        title: 'Ecriture academique',
        description: 'Travaillez un style d ecriture plus formel.',
        level: 'C1',
        type: 'fill-gap',
        image: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        targetLanguage: 'fr',
        questions: [
            {
                id: 'g1',
                question: 'Furthermore, we must consider...',
                parts: ['De plus, nous devons ', '...'],
                correctAnswers: ['considérer']
            },
            {
                id: 'g2',
                question: 'Therefore, the conclusion is...',
                parts: ['Par conséquent, la ', ' est...'],
                correctAnswers: ['conclusion']
            }
        ]
    }
];
