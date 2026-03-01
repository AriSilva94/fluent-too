import { Quiz } from './types';

export const quizzesPt: Quiz[] = [
  // A1 Level
  {
    id: 'a1-pt-basics-mc',
    title: 'Saudacoes basicas',
    description: 'Teste seu conhecimento sobre saudacoes comuns em portugues.',
    level: 'A1',
    type: 'multiple-choice',
    image: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    targetLanguage: 'pt',
    questions: [
      {
        id: 'q1',
        question: 'How do you say "Good morning"?',
        options: ['Boa tarde', 'Bom dia', 'Boa noite', 'Olá'],
        correctAnswer: 'Bom dia',
        explanation: 'Bom dia is used until noon.'
      },
      {
        id: 'q2',
        question: 'Which phrase means "My name is..."?',
        options: ['Eu sou...', 'Meu nome é...', 'Como vai?', 'Tudo bem?'],
        correctAnswer: 'Meu nome é...',
        explanation: 'Meu nome é... directly translates to My name is...'
      },
      {
        id: 'q3',
        question: 'Translate "Thank you".',
        options: ['Desculpa', 'Por favor', 'Obrigado', 'De nada'],
        correctAnswer: 'Obrigado',
        explanation: 'Obrigado (male) or Obrigada (female) means Thank you.'
      }
    ]
  },
  {
    id: 'a1-pt-numbers-mc',
    title: 'Numeros de 1 a 10',
    description: 'Aprenda a contar em portugues.',
    level: 'A1',
    type: 'multiple-choice',
    image: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    targetLanguage: 'pt',
    questions: [
      {
        id: 'q1',
        question: 'What is "Um"?',
        options: ['One', 'Two', 'Three', 'Four'],
        correctAnswer: 'One'
      },
      {
        id: 'q2',
        question: 'What is "Five"?',
        options: ['Quatro', 'Cinco', 'Seis', 'Sete'],
        correctAnswer: 'Cinco'
      }
    ]
  },
  {
    id: 'a1-pt-colors-gap',
    title: 'Cores',
    description: 'Identifique cores em portugues.',
    level: 'A1',
    type: 'fill-gap',
    image: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    targetLanguage: 'pt',
    questions: [
      {
        id: 'g1',
        question: 'O céu é _____ (blue).',
        parts: ['O céu é ', '.'],
        correctAnswers: ['azul']
      },
      {
        id: 'g2',
        question: 'A maçã é _____ (red).',
        parts: ['A maçã é ', '.'],
        correctAnswers: ['vermelha']
      }
    ]
  },
   {
    id: 'a1-pt-days-mc',
    title: 'Dias da semana',
    description: 'Aprenda os dias da semana em portugues.',
    level: 'A1',
    type: 'multiple-choice',
    image: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
    targetLanguage: 'pt',
    questions: [
      {
        id: 'q1',
        question: 'What is "Monday"?',
        options: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira'],
        correctAnswer: 'Segunda-feira'
      },
      {
        id: 'q2',
        question: 'What is "Friday"?',
        options: ['Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'],
        correctAnswer: 'Sexta-feira'
      }
    ]
  },

  // A2 Level
  {
    id: 'a2-pt-routine-gap',
    title: 'Rotina diaria',
    description: 'Complete as frases com acoes do dia a dia.',
    level: 'A2',
    type: 'fill-gap',
    image: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    targetLanguage: 'pt',
    questions: [
      {
        id: 'g1',
        question: 'Complete the sentence.',
        parts: ['Eu ', ' às 7 da manhã.'],
        correctAnswers: ['acordo'],
        explanation: 'Acordo means "I wake up".'
      },
      {
        id: 'g2',
        question: 'Complete the sentence.',
        parts: ['Ela ', ' café da manhã.'],
        correctAnswers: ['toma'],
        explanation: 'Tomar café da manhã = to have breakfast.'
      }
    ]
  },
  {
    id: 'a2-pt-food-mc',
    title: 'Comidas e bebidas',
    description: 'Vocabulario para fazer pedidos em restaurantes.',
    level: 'A2',
    type: 'multiple-choice',
    image: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    targetLanguage: 'pt',
    questions: [
      {
        id: 'q1',
        question: 'What is "Frango"?',
        options: ['Beef', 'Fish', 'Chicken', 'Pork'],
        correctAnswer: 'Chicken'
      },
      {
        id: 'q2',
        question: 'How do you ask for the bill?',
        options: ['A conta, por favor', 'O cardápio, por favor', 'Onde é o banheiro?', 'Mais um'],
        correctAnswer: 'A conta, por favor'
      }
    ]
  },
  {
    id: 'a2-pt-transport-gap',
    title: 'Transporte',
    description: 'Expressoes para se locomover pela cidade.',
    level: 'A2',
    type: 'fill-gap',
    image: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    targetLanguage: 'pt',
    questions: [
      {
        id: 'g1',
        question: 'I take the bus.',
        parts: ['Eu pego o ', '.'],
        correctAnswers: ['ônibus']
      },
      {
        id: 'g2',
        question: 'Where is the subway station?',
        parts: ['Onde fica a estação de ', '?'],
        correctAnswers: ['metrô']
      }
    ]
  },
  {
    id: 'a2-pt-clothes-mc',
    title: 'Roupas',
    description: 'Vocabulario sobre pecas de roupa.',
    level: 'A2',
    type: 'multiple-choice',
    image: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    targetLanguage: 'pt',
    questions: [
      {
        id: 'q1',
        question: 'What is "Camisa"?',
        options: ['Shirt', 'Pants', 'Shoes', 'Hat'],
        correctAnswer: 'Shirt'
      },
      {
        id: 'q2',
        question: 'What are "Sapatos"?',
        options: ['Socks', 'Shoes', 'Gloves', 'Scarf'],
        correctAnswer: 'Shoes'
      }
    ]
  },

  // B1 Level
  {
    id: 'b1-pt-verbs-gap',
    title: 'Verbos no passado',
    description: 'Conjugue verbos no tempo passado.',
    level: 'B1',
    type: 'fill-gap',
    image: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
    targetLanguage: 'pt',
    questions: [
      {
        id: 'g1',
        question: 'Ontem, nós _____ (ir) ao cinema.',
        parts: ['Ontem, nós ', ' ao cinema.'],
        correctAnswers: ['fomos'],
        explanation: 'Fomos is the specialized past form of ir for nós.'
      },
      {
        id: 'g2',
        question: 'Eles _____ (comer) pizza.',
        parts: ['Eles ', ' pizza.'],
        correctAnswers: ['comeram'],
        explanation: 'Comeram is the past tense of comer for eles.'
      }
    ]
  },
  {
    id: 'b1-pt-travel-mc',
    title: 'Vocabulario de viagem',
    description: 'Palavras uteis para situacoes de viagem.',
    level: 'B1',
    type: 'multiple-choice',
    image: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    targetLanguage: 'pt',
    questions: [
      {
        id: 'q1',
        question: 'What is "Bagagem"?',
        options: ['Ticket', 'Luggage', 'Passport', 'Airport'],
        correctAnswer: 'Luggage'
      },
      {
        id: 'q2',
        question: 'Translate "Alfândega".',
        options: ['Customs', 'Border', 'Police', 'Security'],
        correctAnswer: 'Customs'
      }
    ]
  },
  {
    id: 'b1-pt-future-gap',
    title: 'Tempo futuro',
    description: 'Pratique como falar sobre o futuro.',
    level: 'B1',
    type: 'fill-gap',
    image: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    targetLanguage: 'pt',
    questions: [
      {
        id: 'g1',
        question: 'Amanhã eu _____ (viajar).',
        parts: ['Amanhã eu ', '.'],
        correctAnswers: ['viajarei']
      },
      {
        id: 'g2',
        question: 'Eles _____ (chegar) tarde.',
        parts: ['Eles ', ' tarde.'],
        correctAnswers: ['chegarão']
      }
    ]
  },
  {
    id: 'b1-pt-health-mc',
    title: 'Saude e corpo',
    description: 'Expressoes para falar sobre saude.',
    level: 'B1',
    type: 'multiple-choice',
    image: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    targetLanguage: 'pt',
    questions: [
      {
        id: 'q1',
        question: 'What is "Dor de cabeça"?',
        options: ['Backache', 'Headache', 'Stomachache', 'Toothache'],
        correctAnswer: 'Headache'
      },
      {
        id: 'q2',
        question: 'Translate "Médico".',
        options: ['Nurse', 'Doctor', 'Patient', 'Hospital'],
        correctAnswer: 'Doctor'
      }
    ]
  },

  // B2 Level
  {
    id: 'b2-pt-idioms-mc',
    title: 'Expressoes idiomaticas',
    description: 'Aprenda expressoes comuns em portugues.',
    level: 'B2',
    type: 'multiple-choice',
    image: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    targetLanguage: 'pt',
    questions: [
      {
        id: 'q1',
        question: 'What does "Pagar o pato" mean?',
        options: ['To pay the duck', 'To take the blame', 'To buy dinner', 'To feed the animals'],
        correctAnswer: 'To take the blame',
        explanation: 'Pagar o pato means to suffer the consequences for something you didn’t do or for a collective mistake.'
      },
      {
        id: 'q2',
        question: 'Meaning of "Baixar a bola"?',
        options: ['Play football', 'Drop the ball', 'Calm down / Be humble', 'Score a goal'],
        correctAnswer: 'Calm down / Be humble'
      }
    ]
  },
  {
    id: 'b2-pt-environment-gap',
    title: 'Meio ambiente e natureza',
    description: 'Vocabulário para discutir questoes ambientais.',
    level: 'B2',
    type: 'fill-gap',
    image: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    targetLanguage: 'pt',
    questions: [
      {
        id: 'g1',
        question: 'Aquecimento ______ é um grande problema.',
        parts: ['Aquecimento ', ' é um grande problema.'],
        correctAnswers: ['global']
      },
      {
        id: 'g2',
        question: 'Devemos ______ a natureza.',
        parts: ['Devemos ', ' a natureza.'],
        correctAnswers: ['preservar']
      }
    ]
  },
  {
    id: 'b2-pt-politics-mc',
    title: 'Politica e sociedade',
    description: 'Vocabulário relacionado a politica e sociedade.',
    level: 'B2',
    type: 'multiple-choice',
    image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    targetLanguage: 'pt',
    questions: [
      {
        id: 'q1',
        question: 'What is "Eleição"?',
        options: ['Selection', 'Election', 'Collection', 'Correction'],
        correctAnswer: 'Election'
      },
      {
        id: 'q2',
        question: 'Translate "Governo".',
        options: ['Governor', 'Government', 'Governance', 'Guide'],
        correctAnswer: 'Government'
      }
    ]
  },
  {
    id: 'b2-pt-technology-gap',
    title: 'Tecnologia',
    description: 'Vocabulário util para contextos de tecnologia.',
    level: 'B2',
    type: 'fill-gap',
    image: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
    targetLanguage: 'pt',
    questions: [
      {
        id: 'g1',
        question: 'I need to download the file.',
        parts: ['Preciso ', ' o arquivo.'],
        correctAnswers: ['baixar']
      },
      {
        id: 'g2',
        question: 'The wifi is slow.',
        parts: ['O wifi está ', '.'],
        correctAnswers: ['lento']
      }
    ]
  },

    // C1/C2 Level
    {
        id: 'c1-pt-literature-mc',
        title: 'Analise literaria',
        description: 'Aprofunde-se em conceitos da literatura classica em portugues.',
        level: 'C1',
        type: 'multiple-choice',
        image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        targetLanguage: 'pt',
        questions: [
            {
                id: 'q1',
                question: 'Who wrote "Os Lusíadas"?',
                options: ['Fernando Pessoa', 'Luís de Camões', 'José Saramago', 'Machado de Assis'],
                correctAnswer: 'Luís de Camões'
            },
            {
                id: 'q2',
                question: 'What is the main theme of "Mensagem"?',
                options: ['Cooking', 'The history and destiny of Portugal', 'Romantic love', 'Nature'],
                correctAnswer: 'The history and destiny of Portugal'
            }
        ]
    },
    {
        id: 'c1-pt-subjunctive-gap',
        title: 'Subjuntivo avancado',
        description: 'Usos mais avancados do modo subjuntivo.',
        level: 'C1',
        type: 'fill-gap',
        image: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
        targetLanguage: 'pt',
        questions: [
            {
                id: 'g1',
                question: 'Se eu _____ (saber) disso, teria avisado.',
                parts: ['Se eu ', ' disso, teria avisado.'],
                correctAnswers: ['soubesse']
            },
            {
                id: 'g2',
                question: 'Embora ele _____ (ser) rico, não é feliz.',
                parts: ['Embora ele ', ' rico, não é feliz.'],
                correctAnswers: ['seja']
            }
        ]
    },
    {
        id: 'c1-pt-business-mc',
        title: 'Portugues para negocios',
        description: 'Vocabulário corporativo e profissional.',
        level: 'C1',
        type: 'multiple-choice',
        image: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
        targetLanguage: 'pt',
        questions: [
            {
                id: 'q1',
                question: 'What is "Lucro"?',
                options: ['Loss', 'Profit', 'Luck', 'Lock'],
                correctAnswer: 'Profit'
            },
            {
                id: 'q2',
                question: 'Translate "Investimento".',
                options: ['Investigation', 'Investment', 'Invention', 'Invitation'],
                correctAnswer: 'Investment'
            }
        ]
    },
    {
        id: 'c1-pt-academic-gap',
        title: 'Escrita academica',
        description: 'Pratique um estilo de escrita mais formal.',
        level: 'C1',
        type: 'fill-gap',
        image: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        targetLanguage: 'pt',
        questions: [
            {
                id: 'g1',
                question: 'Furthermore, we must consider...',
                parts: ['Além disso, ', ' considerar...'],
                correctAnswers: ['devemos']
            },
            {
                id: 'g2',
                question: 'Therefore, the conclusion is...',
                parts: ['Portanto, a ', ' é...'],
                correctAnswers: ['conclusão']
            }
        ]
    }
];
