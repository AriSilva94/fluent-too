import { Quiz } from './types';

export const quizzesEn: Quiz[] = [
  // A1 Level
  {
    id: 'a1-en-basics-mc',
    title: 'Basic Greetings',
    description: 'Test your knowledge of common English greetings.',
    level: 'A1',
    type: 'multiple-choice',
    image: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    targetLanguage: 'en',
    questions: [
      {
        id: 'q1',
        question: 'Como se diz "Bom dia"?',
        options: ['Good afternoon', 'Good morning', 'Good night', 'Hello'],
        correctAnswer: 'Good morning'
      },
      {
        id: 'q2',
        question: 'Which phrase means "Eu sou..."?',
        options: ['I am...', 'My name is...', 'How are you?', 'Are you okay?'],
        correctAnswer: 'I am...'
      }
    ]
  },
  {
    id: 'a1-en-numbers-mc',
    title: 'Numbers 1-10',
    description: 'Learn to count in English.',
    level: 'A1',
    type: 'multiple-choice',
    image: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    targetLanguage: 'en',
    questions: [
      {
        id: 'q1',
        question: 'What is "Um"?',
        options: ['One', 'Two', 'Three', 'Four'],
        correctAnswer: 'One'
      },
      {
        id: 'q2',
        question: 'What is "Cinco"?',
        options: ['Four', 'Five', 'Six', 'Seven'],
        correctAnswer: 'Five'
      }
    ]
  },
  {
    id: 'a1-en-colors-gap',
    title: 'Colors',
    description: 'Identify colors in English.',
    level: 'A1',
    type: 'fill-gap',
    image: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    targetLanguage: 'en',
    questions: [
      {
        id: 'g1',
        question: 'The sky is _____ (azul).',
        parts: ['The sky is ', '.'],
        correctAnswers: ['blue']
      },
      {
        id: 'g2',
        question: 'The apple is _____ (vermelha).',
        parts: ['The apple is ', '.'],
        correctAnswers: ['red']
      }
    ]
  },
   {
    id: 'a1-en-days-mc',
    title: 'Days of the Week',
    description: 'Learn the days of the week.',
    level: 'A1',
    type: 'multiple-choice',
    image: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
    targetLanguage: 'en',
    questions: [
      {
        id: 'q1',
        question: 'What is "Segunda-feira"?',
        options: ['Sunday', 'Monday', 'Tuesday', 'Wednesday'],
        correctAnswer: 'Monday'
      },
      {
        id: 'q2',
        question: 'What is "Sexta-feira"?',
        options: ['Thursday', 'Friday', 'Saturday', 'Sunday'],
        correctAnswer: 'Friday'
      }
    ]
  },

  // A2 Level
  {
    id: 'a2-en-routine-gap',
    title: 'Daily Routine',
    description: 'Fill in the blanks for daily activities.',
    level: 'A2',
    type: 'fill-gap',
    image: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    targetLanguage: 'en',
    questions: [
      {
        id: 'g1',
        question: 'Complete the sentence.',
        parts: ['I ', ' up at 7 AM.'],
        correctAnswers: ['wake']
      },
      {
        id: 'g2',
        question: 'Complete the sentence.',
        parts: ['She ', ' breakfast.'],
        correctAnswers: ['has']
      }
    ]
  },
  {
    id: 'a2-en-food-mc',
    title: 'Food & Drinks',
    description: 'Vocabulary for ordering in a restaurant.',
    level: 'A2',
    type: 'multiple-choice',
    image: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    targetLanguage: 'en',
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
        options: ['The bill, please', 'The menu, please', 'Where is the bathroom?', 'One more'],
        correctAnswer: 'The bill, please'
      }
    ]
  },
  {
    id: 'a2-en-transport-gap',
    title: 'Transport',
    description: 'Getting around the city.',
    level: 'A2',
    type: 'fill-gap',
    image: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    targetLanguage: 'en',
    questions: [
      {
        id: 'g1',
        question: 'Eu pego o ônibus.',
        parts: ['I take the ', '.'],
        correctAnswers: ['bus']
      },
      {
        id: 'g2',
        question: 'Where is the subway station?',
        parts: ['Where is the ', ' station?'],
        correctAnswers: ['subway']
      }
    ]
  },
  {
    id: 'a2-en-clothes-mc',
    title: 'Clothing',
    description: 'Vocabulary for clothes.',
    level: 'A2',
    type: 'multiple-choice',
    image: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    targetLanguage: 'en',
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
    id: 'b1-en-verbs-gap',
    title: 'Past Tense Verbs',
    description: 'Conjugate verbs in the past tense.',
    level: 'B1',
    type: 'fill-gap',
    image: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
    targetLanguage: 'en',
    questions: [
      {
        id: 'g1',
        question: 'Yesterday, we _____ (go) to the cinema.',
        parts: ['Yesterday, we ', ' to the cinema.'],
        correctAnswers: ['went']
      },
      {
        id: 'g2',
        question: 'They _____ (eat) pizza.',
        parts: ['They ', ' pizza.'],
        correctAnswers: ['ate']
      }
    ]
  },
  {
    id: 'b1-en-travel-mc',
    title: 'Travel vocabulary',
    description: 'Useful words for travelers.',
    level: 'B1',
    type: 'multiple-choice',
    image: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    targetLanguage: 'en',
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
    id: 'b1-en-future-gap',
    title: 'Future Tense',
    description: 'Talking about the future.',
    level: 'B1',
    type: 'fill-gap',
    image: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    targetLanguage: 'en',
    questions: [
      {
        id: 'g1',
        question: 'Tomorrow I _____ (travel).',
        parts: ['Tomorrow I ', '.'],
        correctAnswers: ['will travel']
      },
      {
        id: 'g2',
        question: 'They _____ (arrive) late.',
        parts: ['They ', ' late.'],
        correctAnswers: ['will arrive']
      }
    ]
  },
  {
    id: 'b1-en-health-mc',
    title: 'Health & Body',
    description: 'Talking about health issues.',
    level: 'B1',
    type: 'multiple-choice',
    image: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    targetLanguage: 'en',
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
    id: 'b2-en-idioms-mc',
    title: 'English Idioms',
    description: 'Learn common expressions.',
    level: 'B2',
    type: 'multiple-choice',
    image: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    targetLanguage: 'en',
    questions: [
      {
        id: 'q1',
        question: 'What does "Break a leg" mean?',
        options: ['Hurt yourself', 'Good luck', 'Stop it', 'Dance'],
        correctAnswer: 'Good luck'
      },
      {
        id: 'q2',
        question: 'Meaning of "Bite the bullet"?',
        options: ['Eat metal', 'Face a difficult situation', 'Shoot a gun', 'Run away'],
        correctAnswer: 'Face a difficult situation'
      }
    ]
  },
  {
    id: 'b2-en-environment-gap',
    title: 'Environment & Nature',
    description: 'Discussing environmental issues.',
    level: 'B2',
    type: 'fill-gap',
    image: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    targetLanguage: 'en',
    questions: [
      {
        id: 'g1',
        question: 'Global ______ is a big problem.',
        parts: ['Global ', ' is a big problem.'],
        correctAnswers: ['warming']
      },
      {
        id: 'g2',
        question: 'We must ______ nature.',
        parts: ['We must ', ' nature.'],
        correctAnswers: ['preserve']
      }
    ]
  },
  {
    id: 'b2-en-politics-mc',
    title: 'Politics & Society',
    description: 'Vocabulary related to politics.',
    level: 'B2',
    type: 'multiple-choice',
    image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    targetLanguage: 'en',
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
    id: 'b2-en-technology-gap',
    title: 'Technology',
    description: 'Tech vocabulary.',
    level: 'B2',
    type: 'fill-gap',
    image: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
    targetLanguage: 'en',
    questions: [
      {
        id: 'g1',
        question: 'I need to download the file.',
        parts: ['I need to ', ' the file.'],
        correctAnswers: ['download']
      },
      {
        id: 'g2',
        question: 'The wifi is slow.',
        parts: ['The wifi is ', '.'],
        correctAnswers: ['slow']
      }
    ]
  },

    // C1/C2 Level
    {
        id: 'c1-en-literature-mc',
        title: 'Literature Analysis',
        description: 'Deep dive into classic English literature.',
        level: 'C1',
        type: 'multiple-choice',
        image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        targetLanguage: 'en',
        questions: [
            {
                id: 'q1',
                question: 'Who wrote "Hamlet"?',
                options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
                correctAnswer: 'William Shakespeare'
            },
            {
                id: 'q2',
                question: 'What is the main theme of "1984"?',
                options: ['Cooking', 'Totalitarianism', 'Romantic love', 'Nature'],
                correctAnswer: 'Totalitarianism'
            }
        ]
    },
    {
        id: 'c1-en-subjunctive-gap',
        title: 'Complex Grammar',
        description: 'Advanced uses of the subjunctive mood.',
        level: 'C1',
        type: 'fill-gap',
        image: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
        targetLanguage: 'en',
        questions: [
            {
                id: 'g1',
                question: 'If I _____ (know), I would have told you.',
                parts: ['If I ', ', I would have told you.'],
                correctAnswers: ['had known']
            },
            {
                id: 'g2',
                question: 'I suggest that he _____ (go) to the doctor.',
                parts: ['I suggest that he ', ' to the doctor.'],
                correctAnswers: ['go']
            }
        ]
    },
    {
        id: 'c1-en-business-mc',
        title: 'Business English',
        description: 'Corporate vocabulary.',
        level: 'C1',
        type: 'multiple-choice',
        image: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
        targetLanguage: 'en',
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
        id: 'c1-en-academic-gap',
        title: 'Academic Writing',
        description: 'Formal writing style.',
        level: 'C1',
        type: 'fill-gap',
        image: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        targetLanguage: 'en',
        questions: [
            {
                id: 'g1',
                question: 'Furthermore, we must consider...',
                parts: ['Furthermore, we must ', '...'],
                correctAnswers: ['consider']
            },
            {
                id: 'g2',
                question: 'Therefore, the conclusion is...',
                parts: ['Therefore, the ', ' is...'],
                correctAnswers: ['conclusion']
            }
        ]
    }
];
