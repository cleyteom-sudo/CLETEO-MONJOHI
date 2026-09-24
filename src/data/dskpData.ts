import { SkillType, TPLevel } from '../types';

export interface DskpLearningStandard {
  code: string; // e.g., '1.1.1'
  contentStandardCode: string; // e.g., '1.1'
  contentStandardDesc: string;
  description: string;
  focus: string;
}

export interface DskpYearCurriculum {
  year: number;
  cefrLevel: string; // e.g., 'Working towards A1 (Pre-A1)', 'A1 Low', 'A2 Mid'
  curriculumFramework: string; // 'KSSR Semakan Bahasa Inggeris'
  themes: string[];
  skills: Record<SkillType, {
    contentStandards: {
      code: string;
      description: string;
    }[];
    learningStandards: DskpLearningStandard[];
    tpDescriptors: Record<TPLevel, string>;
    recommendedInterventions: {
      title: string;
      learningStandardCode: string;
      targetTP: TPLevel;
      description: string;
      activities: string[];
    }[];
    sampleTasks: {
      title: string;
      standardCode: string;
      description: string;
    }[];
  }>;
}

export const DSKP_CURRICULUM_YEARS: Record<number, DskpYearCurriculum> = {
  // ===================== YEAR 1 =====================
  1: {
    year: 1,
    cefrLevel: 'Pre-A1 (Starter)',
    curriculumFramework: 'DSKP KSSR Semakan Tahun 1 (CEFR Aligned)',
    themes: ['World of Self, Family and Friends', 'World of Stories', 'World of Knowledge'],
    skills: {
      Listening: {
        contentStandards: [
          { code: '1.1', description: 'Recognise and reproduce target language sounds' },
          { code: '1.2', description: 'Understand meaning in a variety of familiar contexts' },
        ],
        learningStandards: [
          {
            code: '1.1.1',
            contentStandardCode: '1.1',
            contentStandardDesc: 'Recognise and reproduce target language sounds',
            description: 'Recognise and reproduce with support a limited range of high frequency target language phonemes (/s/, /a/, /t/, /p/, /i/, /n/).',
            focus: 'Phonemic awareness and sound discrimination',
          },
          {
            code: '1.2.1',
            contentStandardCode: '1.2',
            contentStandardDesc: 'Understand meaning in a variety of familiar contexts',
            description: 'Understand with support the main idea of very simple phrases and sentences.',
            focus: 'Grasping primary meaning from simple spoken prompts',
          },
          {
            code: '1.2.2',
            contentStandardCode: '1.2',
            contentStandardDesc: 'Understand meaning in a variety of familiar contexts',
            description: 'Understand with support specific information and details of very simple phrases and sentences.',
            focus: 'Identifying simple keywords like colors, numbers, and classroom objects',
          },
        ],
        tpDescriptors: {
          TP1: 'Can hardly recognise phonemes or understand simple spoken instructions even with visual prompts and extensive teacher support.',
          TP2: 'Can recognise a few target sounds and understand minimal spoken phrases with continuous teacher guidance.',
          TP3: 'Can recognise and reproduce target phonemes and understand main ideas of very simple phrases with teacher support (Minimum Requirement).',
          TP4: 'Can listen to and identify specific details of simple phrases and follow two-step classroom instructions clearly.',
          TP5: 'Can understand meaning in familiar contexts confidently and respond accurately with minimal prompting.',
          TP6: 'Can demonstrate independent auditory discrimination, grasp complex spoken classroom details, and guide peers.',
        },
        recommendedInterventions: [
          {
            title: 'Jolly Phonics Multisensory Sound Discrimination',
            learningStandardCode: '1.1.1',
            targetTP: 'TP3',
            description: 'Action-based audio drills focusing on initial /s/, /a/, /t/, /p/ blending.',
            activities: ['Phonics chant with Milo Buddy', 'Touch & Match audio cards', 'Clap on target phoneme'],
          },
        ],
        sampleTasks: [
          { title: 'Listen & Point: Classroom Objects', standardCode: '1.2.2', description: 'Pupil listens to audio clip and taps the correct item.' },
          { title: 'Phonics Sound Match', standardCode: '1.1.1', description: 'Match spoken letter sound with alphabet picture.' },
        ],
      },
      Speaking: {
        contentStandards: [
          { code: '2.1', description: 'Communicate simple information intelligibly' },
          { code: '2.2', description: 'Use appropriate communication strategies' },
        ],
        learningStandards: [
          {
            code: '2.1.1',
            contentStandardCode: '2.1',
            contentStandardDesc: 'Communicate simple information intelligibly',
            description: 'Give very basic personal information using fixed phrases ("My name is...", "I am 7 years old").',
            focus: 'Self-introduction and naming familiar items',
          },
          {
            code: '2.1.2',
            contentStandardCode: '2.1',
            contentStandardDesc: 'Communicate simple information intelligibly',
            description: 'Find out about very basic personal information using fixed questions ("What is your name?").',
            focus: 'Simple peer interaction and questioning',
          },
          {
            code: '2.1.5',
            contentStandardCode: '2.1',
            contentStandardDesc: 'Communicate simple information intelligibly',
            description: 'Name or describe objects using suitable words (colors, shapes, sizes).',
            focus: 'Descriptive vocabulary in spoken form',
          },
        ],
        tpDescriptors: {
          TP1: 'Can hardly produce intelligible spoken phrases or state personal name even with extensive teacher prompting.',
          TP2: 'Can communicate single words or simple fixed phrases with heavy teacher assistance and hesitation.',
          TP3: 'Can communicate basic personal information using fixed phrases with acceptable pronunciation and support.',
          TP4: 'Can introduce self, answer simple questions, and describe classroom items clearly and intelligibly.',
          TP5: 'Can speak confidently using complete simple sentences with good pronunciation and rhythm.',
          TP6: 'Can initiate spoken conversations spontaneously with high confidence and role model fluency for classmates.',
        },
        recommendedInterventions: [
          {
            title: 'Echo Speaking: My Name & My World',
            learningStandardCode: '2.1.1',
            targetTP: 'TP3',
            description: 'Paired speaking drills with Milo the AI buddy using structured sentence frames.',
            activities: ['Repeat after Milo phrase echo', 'Puppet dialogue', 'Flashcard name call'],
          },
        ],
        sampleTasks: [
          { title: 'Self Introduction Greeting', standardCode: '2.1.1', description: 'Say your name, age, and favorite color into the voice recorder.' },
        ],
      },
      Reading: {
        contentStandards: [
          { code: '3.1', description: 'Recognise words in linear and non-linear texts by using knowledge of sounds of letters' },
          { code: '3.2', description: 'Understand a variety of linear and non-linear print and digital texts' },
        ],
        learningStandards: [
          {
            code: '3.1.1',
            contentStandardCode: '3.1',
            contentStandardDesc: 'Recognise words in linear and non-linear texts',
            description: 'Identify and recognise the shapes of the letters in the alphabet.',
            focus: 'Letter recognition and alphabet matching',
          },
          {
            code: '3.1.2',
            contentStandardCode: '3.1',
            contentStandardDesc: 'Recognise words in linear and non-linear texts',
            description: 'Recognise and sound out with support beginning, medial and final sounds in a word (CVC words: cat, pin, top).',
            focus: 'Blending and segmenting simple CVC words',
          },
          {
            code: '3.2.2',
            contentStandardCode: '3.2',
            contentStandardDesc: 'Understand texts by using reading strategies',
            description: 'Understand specific information and details of very simple phrases and sentences.',
            focus: 'Reading comprehension with picture cues',
          },
        ],
        tpDescriptors: {
          TP1: 'Can hardly identify letter shapes or sound out letters even with direct teacher scaffolding.',
          TP2: 'Can recognise a few alphabet letters and match single words to pictures with guidance.',
          TP3: 'Can blend simple CVC words and understand meaning of simple picture-word sentences with support.',
          TP4: 'Can read simple sentences smoothly and answer basic who/what questions accurately.',
          TP5: 'Can read short picture stories independently with clear comprehension and good pace.',
          TP6: 'Can read independently with expressive inflection and self-correct unfamiliar words.',
        },
        recommendedInterventions: [
          {
            title: 'CVC Word Slider & Blending Practice',
            learningStandardCode: '3.1.2',
            targetTP: 'TP3',
            description: 'Systematic phonics reading deck blending onset and rime for 20 high-frequency words.',
            activities: ['Digital word slider', 'Audio word builder', 'Sight word hunt'],
          },
        ],
        sampleTasks: [
          { title: 'Read & Tap: Color Words', standardCode: '3.1.2', description: 'Read CVC words and tap matching cartoon graphics.' },
        ],
      },
      Writing: {
        contentStandards: [
          { code: '4.1', description: 'Form letters and words in neat legible print using cursive/print writing' },
          { code: '4.2', description: 'Communicate basic information intelligibly for a range of purposes' },
        ],
        learningStandards: [
          {
            code: '4.1.2',
            contentStandardCode: '4.1',
            contentStandardDesc: 'Form letters and words in neat legible print',
            description: 'Form upper and lower case letters of regular size and shape.',
            focus: 'Letter formation and pencil control',
          },
          {
            code: '4.2.1',
            contentStandardCode: '4.2',
            contentStandardDesc: 'Communicate basic information intelligibly',
            description: 'Give very basic personal information using fixed phrases in print.',
            focus: 'Filling in simple name, age, and greeting templates',
          },
        ],
        tpDescriptors: {
          TP1: 'Can hardly form recognizable letter shapes or write name correctly even with tracing lines.',
          TP2: 'Can copy words and form some letters with inconsistent size and spacing with support.',
          TP3: 'Can write simple words and complete short fixed sentences with satisfactory legibility.',
          TP4: 'Can write neat, legible simple sentences with correct basic punctuation (capital letter, full stop).',
          TP5: 'Can write 2 to 3 simple sentences about self or classroom objects with good accuracy and neatness.',
          TP6: 'Can write short creative sentences independently with excellent spelling and neat cursive/print form.',
        },
        recommendedInterventions: [
          {
            title: 'Letter Stroke Tracing & Sentence Starter',
            learningStandardCode: '4.1.2',
            targetTP: 'TP3',
            description: 'Tracing canvas exercises for letter heights (ascenders, descenders) and basic sentence frames.',
            activities: ['Digital canvas finger-tracing', 'Fill-in-the-blank personal badge', 'Copy sentence challenge'],
          },
        ],
        sampleTasks: [
          { title: 'Write My Name & Favorite Animal', standardCode: '4.2.1', description: 'Write: "I am [Name]. I like cats."' },
        ],
      },
    },
  },

  // ===================== YEAR 2 =====================
  2: {
    year: 2,
    cefrLevel: 'Pre-A1 to A1 Low',
    curriculumFramework: 'DSKP KSSR Semakan Tahun 2 (CEFR Aligned)',
    themes: ['World of Self, Family and Friends', 'World of Stories', 'World of Knowledge'],
    skills: {
      Listening: {
        contentStandards: [
          { code: '1.2', description: 'Understand meaning in a variety of familiar contexts' },
          { code: '1.3', description: 'Use appropriate listening strategies in a variety of contexts' },
        ],
        learningStandards: [
          {
            code: '1.2.2',
            contentStandardCode: '1.2',
            contentStandardDesc: 'Understand meaning in familiar contexts',
            description: 'Understand with support specific information and details of simple sentences.',
            focus: 'Extracting key facts from teacher instructions and short dialogues',
          },
          {
            code: '1.2.3',
            contentStandardCode: '1.2',
            contentStandardDesc: 'Understand meaning in familiar contexts',
            description: 'Understand with support simple longer classroom instructions.',
            focus: 'Multi-step action sequences in classroom routine',
          },
        ],
        tpDescriptors: {
          TP1: 'Can hardly understand key details of simple sentences even with repetitive teacher guidance.',
          TP2: 'Can understand familiar isolated words with heavy contextual cues and support.',
          TP3: 'Can understand specific information and details of simple sentences with teacher support.',
          TP4: 'Can listen and identify facts in short dialogues and carry out instructions reliably.',
          TP5: 'Can follow narrative audio stories with high comprehension and recall key sequence.',
          TP6: 'Can demonstrate advanced auditory retention and summarize spoken stories effortlessly.',
        },
        recommendedInterventions: [
          {
            title: 'Action Listening: Simon Says PBD Routine',
            learningStandardCode: '1.2.3',
            targetTP: 'TP3',
            description: 'Auditory reaction exercises responding to complex instructions with visual timers.',
            activities: ['Action-verb audio match', 'Two-step command game', 'Story detail check'],
          },
        ],
        sampleTasks: [
          { title: 'My Daily Routine Audio Quiz', standardCode: '1.2.2', description: 'Listen to 3 children describe their morning and select correct clocks.' },
        ],
      },
      Speaking: {
        contentStandards: [
          { code: '2.1', description: 'Communicate simple information intelligibly' },
          { code: '2.3', description: 'Communicate appropriately to a small or large group' },
        ],
        learningStandards: [
          {
            code: '2.1.2',
            contentStandardCode: '2.1',
            contentStandardDesc: 'Communicate simple information intelligibly',
            description: 'Find out about personal information by asking basic questions ("Do you like apples?", "Where is your pencil?").',
            focus: 'Asking and answering yes/no and simple Wh-questions',
          },
          {
            code: '2.1.3',
            contentStandardCode: '2.1',
            contentStandardDesc: 'Communicate simple information intelligibly',
            description: 'Give a short sequence of basic instructions.',
            focus: 'Sequencing connectives (First, Next, Then)',
          },
        ],
        tpDescriptors: {
          TP1: 'Can hardly answer or ask basic questions even with modelled teacher phrases.',
          TP2: 'Can speak short phrases with hesitation and frequent mother-tongue interference.',
          TP3: 'Can ask and answer basic personal questions intelligibly with teacher support.',
          TP4: 'Can converse in simple exchanges and describe daily routines with clear pronunciation.',
          TP5: 'Can express preferences, give reasons simply, and narrate a picture sequence smoothly.',
          TP6: 'Can speak fluently, initiate dialogues, and display confident expressive intonation.',
        },
        recommendedInterventions: [
          {
            title: 'Question Wheel: Ask & Answer Pairs',
            learningStandardCode: '2.1.2',
            targetTP: 'TP3',
            description: 'Spinning prompt wheel practicing "Do you like...", "Can you...", "Is there a...".',
            activities: ['AI Buddy speech prompt', 'Roleplay food market', 'Show and tell item'],
          },
        ],
        sampleTasks: [
          { title: 'Describe My Favorite Toy', standardCode: '2.1.3', description: 'Record a 30-second speech about a favorite toy using colors and sizes.' },
        ],
      },
      Reading: {
        contentStandards: [
          { code: '3.2', description: 'Understand a variety of linear and non-linear print and digital texts' },
        ],
        learningStandards: [
          {
            code: '3.2.2',
            contentStandardCode: '3.2',
            contentStandardDesc: 'Understand texts by using reading strategies',
            description: 'Understand specific information and details of simple sentences in short paragraphs.',
            focus: 'Reading 3-4 sentence paragraphs and answering comprehension questions',
          },
        ],
        tpDescriptors: {
          TP1: 'Can hardly read simple sentences or decode high frequency vocabulary.',
          TP2: 'Can read familiar sight words with assistance but struggles with sentence comprehension.',
          TP3: 'Can read and understand specific information in simple sentences with teacher support.',
          TP4: 'Can read short illustrated texts independently and answer comprehension questions accurately.',
          TP5: 'Can read longer passages smoothly and make simple predictions about story events.',
          TP6: 'Can read independently with exceptional comprehension and discuss story morals with peers.',
        },
        recommendedInterventions: [
          {
            title: 'Guided Reading: Story Safari',
            learningStandardCode: '3.2.2',
            targetTP: 'TP3',
            description: 'Interactive read-along texts with vocabulary flashcards and comprehension checks.',
            activities: ['Highlight the answer game', 'True or False speed round', 'Sentence sequencing'],
          },
        ],
        sampleTasks: [
          { title: 'Animal Habitats Short Read', standardCode: '3.2.2', description: 'Read a short passage about elephants and tap True/False.' },
        ],
      },
      Writing: {
        contentStandards: [
          { code: '4.2', description: 'Communicate basic information intelligibly for a range of purposes' },
          { code: '4.3', description: 'Communicate with appropriate language form and style' },
        ],
        learningStandards: [
          {
            code: '4.2.1',
            contentStandardCode: '4.2',
            contentStandardDesc: 'Communicate basic information intelligibly',
            description: 'Ask for and give basic personal information using basic questions and statements in writing.',
            focus: 'Writing short question and answer pairs',
          },
          {
            code: '4.3.1',
            contentStandardCode: '4.3',
            contentStandardDesc: 'Communicate with appropriate language form and style',
            description: 'Use capital letters and full stops appropriately in guided writing.',
            focus: 'Punctuation accuracy and neat sentence structuring',
          },
        ],
        tpDescriptors: {
          TP1: 'Can hardly write complete words or use capital letters properly.',
          TP2: 'Can write simple words with frequent spelling and punctuation errors.',
          TP3: 'Can write simple sentences with appropriate capital letters and full stops with guidance.',
          TP4: 'Can write 2 to 3 related sentences with good punctuation and minor spelling errors.',
          TP5: 'Can write a neat, coherent short paragraph (3-4 sentences) with correct grammar and vocabulary.',
          TP6: 'Can produce imaginative and grammatically sound short compositions with exemplary presentation.',
        },
        recommendedInterventions: [
          {
            title: 'Punctuation Detective: Capital & Full Stop Hunt',
            learningStandardCode: '4.3.1',
            targetTP: 'TP3',
            description: 'Fixing unpunctuated sentences and writing structured mini-descriptions.',
            activities: ['Sentence repair challenge', 'Sentence rearrangement cards', 'Creative journal entry'],
          },
        ],
        sampleTasks: [
          { title: 'Write About My Weekend', standardCode: '4.2.1', description: 'Write 3 sentences about what you did on Saturday.' },
        ],
      },
    },
  },

  // ===================== YEAR 3 =====================
  3: {
    year: 3,
    cefrLevel: 'A1 Low',
    curriculumFramework: 'DSKP KSSR Semakan Tahun 3 (CEFR Aligned)',
    themes: ['World of Self, Family and Friends', 'World of Stories', 'World of Knowledge'],
    skills: {
      Listening: {
        contentStandards: [
          { code: '1.2', description: 'Understand meaning in a variety of familiar contexts' },
        ],
        learningStandards: [
          {
            code: '1.2.2',
            contentStandardCode: '1.2',
            contentStandardDesc: 'Understand meaning in familiar contexts',
            description: 'Understand with support specific information and details of short simple texts.',
            focus: 'Listening to short monologues and dialogues on everyday topics',
          },
        ],
        tpDescriptors: {
          TP1: 'Can hardly understand spoken short texts even with visual support.',
          TP2: 'Can understand minimal spoken information with teacher prompting and translation.',
          TP3: 'Can understand main ideas and specific details of short simple texts with guidance.',
          TP4: 'Can identify key details in short spoken texts without visual support.',
          TP5: 'Can understand longer audio stories and make sensible inferences about characters.',
          TP6: 'Can demonstrate critical listening skills and explain opinions based on audio input.',
        },
        recommendedInterventions: [
          {
            title: 'Listening Lab: Keyword Hunting',
            learningStandardCode: '1.2.2',
            targetTP: 'TP3',
            description: 'Targeted listening tasks focusing on identifying time, places, and names.',
            activities: ['Fill in the missing audio blanks', 'Audio map navigation', 'Fact check buzzer'],
          },
        ],
        sampleTasks: [
          { title: 'The School Timetable Audio Quiz', standardCode: '1.2.2', description: 'Listen to Amir discuss his Monday subjects and fill in timetable.' },
        ],
      },
      Speaking: {
        contentStandards: [
          { code: '2.1', description: 'Communicate simple information intelligibly' },
        ],
        learningStandards: [
          {
            code: '2.1.5',
            contentStandardCode: '2.1',
            contentStandardDesc: 'Communicate simple information intelligibly',
            description: 'Describe people and objects using suitable words and phrases (personality, appearance, size).',
            focus: 'Using adjectives and comparative structures in speech',
          },
        ],
        tpDescriptors: {
          TP1: 'Can hardly describe a person or object using basic English words.',
          TP2: 'Can speak using isolated adjectives with significant teacher hesitation and support.',
          TP3: 'Can describe people and familiar objects using basic phrases intelligibly.',
          TP4: 'Can describe people, places, and objects with good range of adjectives and clear voice.',
          TP5: 'Can communicate thoughts, compare two items, and maintain a two-way dialogue smoothly.',
          TP6: 'Can deliver an engaging short presentation with expressive vocabulary and natural pace.',
        },
        recommendedInterventions: [
          {
            title: 'Describe & Guess Partner Game',
            learningStandardCode: '2.1.5',
            targetTP: 'TP3',
            description: 'Using structured adjective lists to describe mystery characters.',
            activities: ['Mystery character description', 'Compare two superheroes', 'Speech feedback recording'],
          },
        ],
        sampleTasks: [
          { title: 'Describe My Best Friend', standardCode: '2.1.5', description: 'Speak for 45 seconds about your best friend\'s appearance and hobby.' },
        ],
      },
      Reading: {
        contentStandards: [
          { code: '3.2', description: 'Understand a variety of linear and non-linear print and digital texts' },
        ],
        learningStandards: [
          {
            code: '3.2.2',
            contentStandardCode: '3.2',
            contentStandardDesc: 'Understand texts by using reading strategies',
            description: 'Understand specific information and details of short simple texts.',
            focus: 'Reading non-fiction and narrative texts of 50-80 words',
          },
        ],
        tpDescriptors: {
          TP1: 'Can hardly understand short texts or answer literal comprehension questions.',
          TP2: 'Can decode words with support but exhibits weak literal comprehension.',
          TP3: 'Can understand specific information in short simple texts with guidance.',
          TP4: 'Can read independently with good speed and answer literal and simple inferential questions.',
          TP5: 'Can read a variety of text types and deduce simple word meanings from context.',
          TP6: 'Can read fluently with expressive intonation and critique story characters intelligently.',
        },
        recommendedInterventions: [
          {
            title: 'Read & Solve: Mystery Paragraphs',
            learningStandardCode: '3.2.2',
            targetTP: 'TP3',
            description: 'Short 60-word detective passages answering Who, When, Where, Why.',
            activities: ['Paragraph evidence underline', 'Graphic organizer mapping', 'Comprehension quiz'],
          },
        ],
        sampleTasks: [
          { title: 'Year 3 Rainforest Animals Article', standardCode: '3.2.2', description: 'Read article on Malaysian hornbills and answer 4 questions.' },
        ],
      },
      Writing: {
        contentStandards: [
          { code: '4.3', description: 'Communicate with appropriate language form and style' },
        ],
        learningStandards: [
          {
            code: '4.3.1',
            contentStandardCode: '4.3',
            contentStandardDesc: 'Appropriate language form and style',
            description: 'Use capital letters, full stops and question marks appropriately in guided writing.',
            focus: 'Punctuation, conjunctions (and, but, because), and paragraph formation',
          },
        ],
        tpDescriptors: {
          TP1: 'Can hardly write connected sentences or apply punctuation rules correctly.',
          TP2: 'Can write simple sentences with frequent grammatical and mechanical errors.',
          TP3: 'Can write guided sentences using capital letters, full stops, and question marks with guidance.',
          TP4: 'Can write a short paragraph of 4-5 sentences with good punctuation and appropriate conjunctions.',
          TP5: 'Can write well-developed descriptions with varied vocabulary and minimal errors.',
          TP6: 'Can craft engaging short stories or factual reports with creative flair and near-flawless mechanics.',
        },
        recommendedInterventions: [
          {
            title: 'Sentence Linking: Conjunction Master',
            learningStandardCode: '4.3.1',
            targetTP: 'TP3',
            description: 'Connecting simple sentences using "and", "but", and "because" with correct punctuation.',
            activities: ['Compound sentence maker', 'Guided paragraph template', 'Peer review checklist'],
          },
        ],
        sampleTasks: [
          { title: 'A Day at the Zoo Paragraph', standardCode: '4.3.1', description: 'Write 4 sentences describing an animal you saw and why you like it.' },
        ],
      },
    },
  },

  // ===================== YEAR 4 =====================
  4: {
    year: 4,
    cefrLevel: 'A1 Mid (KSSR Semakan Aligned)',
    curriculumFramework: 'DSKP KSSR Semakan Tahun 4 (CEFR Aligned)',
    themes: ['World of Self, Family and Friends', 'World of Stories', 'World of Knowledge'],
    skills: {
      Listening: {
        contentStandards: [
          { code: '1.2', description: 'Understand meaning in a variety of familiar contexts' },
          { code: '1.3', description: 'Use appropriate listening strategies in a variety of contexts' },
        ],
        learningStandards: [
          {
            code: '1.2.2',
            contentStandardCode: '1.2',
            contentStandardDesc: 'Understand meaning in familiar contexts',
            description: 'Understand with support specific information and details of longer simple texts.',
            focus: 'Tracking narrative flow, character motivations, and factual timelines',
          },
          {
            code: '1.2.5',
            contentStandardCode: '1.2',
            contentStandardDesc: 'Understand meaning in familiar contexts',
            description: 'Understand longer supported questions on a range of familiar topics.',
            focus: 'Responding to detailed verbal inquiry',
          },
        ],
        tpDescriptors: {
          TP1: 'Can hardly track meaning or identify specific details in spoken dialogues even with visual scaffolding.',
          TP2: 'Can understand fragmented details with constant teacher repetition and contextual clues.',
          TP3: 'Can understand specific information and details of longer simple texts with support (Minimum Target).',
          TP4: 'Can understand narrative sequences and factual details clearly without requiring constant repetition.',
          TP5: 'Can follow complex audio texts, deduce character emotions, and note key information accurately.',
          TP6: 'Can comprehend spoken English effortlessly, infer implicit details, and synthesize audio information.',
        },
        recommendedInterventions: [
          {
            title: 'Audio Detective: Timeline Sequencing',
            learningStandardCode: '1.2.2',
            targetTP: 'TP3',
            description: 'Sequencing audio events into chronological cards with audio pause-and-check checkpoints.',
            activities: ['Audio timeline builder', 'Fact vs Fiction buzzer', 'Milo listening coach review'],
          },
        ],
        sampleTasks: [
          { title: 'Celebrations Around the World Audio', standardCode: '1.2.2', description: 'Listen to passage about Hari Raya and Chinese New Year; match customs.' },
        ],
      },
      Speaking: {
        contentStandards: [
          { code: '2.1', description: 'Communicate simple information intelligibly' },
          { code: '2.2', description: 'Use appropriate communication strategies' },
        ],
        learningStandards: [
          {
            code: '2.1.4',
            contentStandardCode: '2.1',
            contentStandardDesc: 'Communicate simple information intelligibly',
            description: 'Give reasons for simple predictions ("I think it will rain because the clouds are dark").',
            focus: 'Cause and effect justification in speech',
          },
          {
            code: '2.2.1',
            contentStandardCode: '2.2',
            contentStandardDesc: 'Use appropriate communication strategies',
            description: 'Keep interaction going in short exchanges by using suitable questions.',
            focus: 'Turn-taking and active verbal engagement',
          },
        ],
        tpDescriptors: {
          TP1: 'Can hardly communicate opinions or give reasons for predictions in English.',
          TP2: 'Can convey fragmented ideas with noticeable hesitation and heavy teacher assistance.',
          TP3: 'Can give simple reasons for predictions and participate in guided conversations with acceptable fluency.',
          TP4: 'Can explain predictions clearly, sustain short exchanges, and use appropriate past and present tenses.',
          TP5: 'Can communicate ideas persuasively with good vocabulary and spontaneous question formulation.',
          TP6: 'Can express views with exemplary clarity, natural intonation, and high grammatical precision.',
        },
        recommendedInterventions: [
          {
            title: 'Prediction Pod: "I think... because..."',
            learningStandardCode: '2.1.4',
            targetTP: 'TP3',
            description: 'Sentence-frame drills connecting ideas with "because", "so", and "although".',
            activities: ['Mystery picture prediction', 'Milo AI speaking buddy dialogue', 'Roleplay debate'],
          },
        ],
        sampleTasks: [
          { title: 'Future Inventions Presentation', standardCode: '2.1.4', description: 'Explain what robot you want to invent and why it will help people.' },
        ],
      },
      Reading: {
        contentStandards: [
          { code: '3.2', description: 'Understand a variety of linear and non-linear print and digital texts' },
        ],
        learningStandards: [
          {
            code: '3.2.2',
            contentStandardCode: '3.2',
            contentStandardDesc: 'Understand texts by using reading strategies',
            description: 'Understand specific information and details of simple longer texts (100-150 words).',
            focus: 'Comprehending non-linear notices, timetables, and linear stories',
          },
        ],
        tpDescriptors: {
          TP1: 'Can hardly read multi-sentence paragraphs or identify key facts in longer texts.',
          TP2: 'Can read portions with support but struggles with text coherence and vocabulary comprehension.',
          TP3: 'Can understand specific information in longer texts with teacher support.',
          TP4: 'Can read independently with good comprehension and locate specific facts quickly.',
          TP5: 'Can read longer texts fluently, determine main ideas, and infer contextual meanings.',
          TP6: 'Can analyze texts critically, identify author purpose, and evaluate story themes independently.',
        },
        recommendedInterventions: [
          {
            title: 'Skim & Scan Safari',
            learningStandardCode: '3.2.2',
            targetTP: 'TP3',
            description: 'Timed reading challenges targeting keyword identification in notices and stories.',
            activities: ['Scan for numbers and dates', 'Dictionary scavenger hunt', 'Summary builder'],
          },
        ],
        sampleTasks: [
          { title: 'The Malayan Tiger Factsheet', standardCode: '3.2.2', description: 'Read factsheet and answer 5 comprehension questions on habitat and diet.' },
        ],
      },
      Writing: {
        contentStandards: [
          { code: '4.2', description: 'Communicate basic information intelligibly for a range of purposes' },
          { code: '4.3', description: 'Communicate with appropriate language form and style' },
        ],
        learningStandards: [
          {
            code: '4.2.4',
            contentStandardCode: '4.2',
            contentStandardDesc: 'Communicate basic information intelligibly',
            description: 'Describe people and objects using suitable statements with varied adjectives.',
            focus: 'Descriptive writing of 50-80 words with structured paragraphs',
          },
          {
            code: '4.3.2',
            contentStandardCode: '4.3',
            contentStandardDesc: 'Appropriate language form and style',
            description: 'Spell most high frequency words accurately in guided writing.',
            focus: 'Spelling accuracy and tense consistency (Simple Past / Present Continuous)',
          },
        ],
        tpDescriptors: {
          TP1: 'Can hardly write coherent sentences or spell high frequency words correctly.',
          TP2: 'Can write simple phrases with frequent grammatical errors and poor cohesion.',
          TP3: 'Can write a short guided paragraph using suitable statements and spelling with support.',
          TP4: 'Can write well-punctuated descriptive paragraphs with good vocabulary and minor spelling errors.',
          TP5: 'Can write varied sentences (simple and compound) with rich vocabulary and clear organization.',
          TP6: 'Can produce well-structured, creative compositions demonstrating advanced vocabulary and flawless mechanics.',
        },
        recommendedInterventions: [
          {
            title: 'Paragraph Architect: Topic & Supporting Sentences',
            learningStandardCode: '4.2.4',
            targetTP: 'TP3',
            description: 'Structured graphic organizers guiding pupils from outline to a completed 60-word paragraph.',
            activities: ['Burger paragraph builder', 'Spelling bee challenge', 'Canvas handwriting submission'],
          },
        ],
        sampleTasks: [
          { title: 'My Hero Essay', standardCode: '4.2.4', description: 'Write 5-6 sentences about someone you admire and describe their qualities.' },
        ],
      },
    },
  },

  // ===================== YEAR 5 =====================
  5: {
    year: 5,
    cefrLevel: 'A2 Low (KSSR Semakan Aligned)',
    curriculumFramework: 'DSKP KSSR Semakan Tahun 5 (CEFR Aligned)',
    themes: ['World of Self, Family and Friends', 'World of Stories', 'World of Knowledge'],
    skills: {
      Listening: {
        contentStandards: [
          { code: '1.2', description: 'Understand meaning in a variety of familiar contexts' },
        ],
        learningStandards: [
          {
            code: '1.2.2',
            contentStandardCode: '1.2',
            contentStandardDesc: 'Understand meaning in familiar contexts',
            description: 'Understand with little or no support specific information and details of longer simple texts on a range of familiar topics.',
            focus: 'Auditory processing of multi-speaker conversations and announcements',
          },
        ],
        tpDescriptors: {
          TP1: 'Can hardly understand longer audio passages or identify details without extensive assistance.',
          TP2: 'Can grasp scattered words but misses overall context and chronological order.',
          TP3: 'Can understand specific information of longer simple texts with minimal support.',
          TP4: 'Can identify main ideas and supporting details in unfamiliar dialogues accurately.',
          TP5: 'Can interpret tone, attitude, and deduce hidden meanings in complex audio clips.',
          TP6: 'Can summarize extended listening passages accurately and debate points heard.',
        },
        recommendedInterventions: [
          {
            title: 'Podcast Listener: News & Interviews',
            learningStandardCode: '1.2.2',
            targetTP: 'TP3',
            description: 'Listening to 2-minute pupil news broadcasts and completing structured graphic notes.',
            activities: ['Note-taking graphic organizer', 'Fact vs Opinion sorting', 'Live quiz response'],
          },
        ],
        sampleTasks: [
          { title: 'The Renewable Energy Radio Interview', standardCode: '1.2.2', description: 'Listen to solar energy discussion and complete factsheet.' },
        ],
      },
      Speaking: {
        contentStandards: [
          { code: '2.1', description: 'Communicate simple information intelligibly' },
          { code: '2.2', description: 'Use appropriate communication strategies' },
        ],
        learningStandards: [
          {
            code: '2.2.1',
            contentStandardCode: '2.2',
            contentStandardDesc: 'Use appropriate communication strategies',
            description: 'Keep interaction going in short exchanges by using suitable words to agree, disagree, or clarify.',
            focus: 'Conversational nuance, polite debate, and expressing points of view',
          },
        ],
        tpDescriptors: {
          TP1: 'Can hardly participate in group discussions or state personal viewpoints.',
          TP2: 'Can express basic opinions with hesitation and simple vocabulary.',
          TP3: 'Can keep interaction going in short exchanges and express agreement/disagreement appropriately.',
          TP4: 'Can participate actively in group discussions and justify opinions logically.',
          TP5: 'Can speak fluently with wide vocabulary, correct idiom usage, and good sentence variation.',
          TP6: 'Can present arguments persuasively, lead group dialogues, and mentor peers in public speaking.',
        },
        recommendedInterventions: [
          {
            title: 'Debate Circle: Agree & Disagree Politeness',
            learningStandardCode: '2.2.1',
            targetTP: 'TP3',
            description: 'Using transition phrases: "In my opinion...", "I see your point, but...", "I agree because...".',
            activities: ['Classroom debate simulation', 'Milo AI discussion partner', 'Speech pacing recorder'],
          },
        ],
        sampleTasks: [
          { title: 'Should School Uniforms Be Compulsory?', standardCode: '2.2.1', description: 'Record a 1-minute persuasive speech presenting 2 solid arguments.' },
        ],
      },
      Reading: {
        contentStandards: [
          { code: '3.2', description: 'Understand a variety of linear and non-linear print and digital texts' },
        ],
        learningStandards: [
          {
            code: '3.2.3',
            contentStandardCode: '3.2',
            contentStandardDesc: 'Understand texts by using reading strategies',
            description: 'Guess the meaning of unfamiliar words from clues provided by other known words and by context.',
            focus: 'Contextual decoding and vocabulary inference',
          },
        ],
        tpDescriptors: {
          TP1: 'Can hardly read complex passages or deduce meanings of unknown vocabulary.',
          TP2: 'Can read literal text but cannot deduce unknown words from context.',
          TP3: 'Can guess word meanings using context clues with occasional teacher guidance.',
          TP4: 'Can read extended texts (150-200 words) and answer inferential questions accurately.',
          TP5: 'Can analyze text structure, author perspective, and figurative expressions easily.',
          TP6: 'Can read extensively across genres with superior comprehension and critical analysis.',
        },
        recommendedInterventions: [
          {
            title: 'Context Clue Cracker',
            learningStandardCode: '3.2.3',
            targetTP: 'TP3',
            description: 'Step-by-step method to deduce meaning using synonyms, antonyms, and sentence context.',
            activities: ['Vocabulary mystery card', 'Prefix/Suffix tree', 'Speed read challenge'],
          },
        ],
        sampleTasks: [
          { title: 'The Great Coral Reef Rescue Article', standardCode: '3.2.3', description: 'Read environmental story and define 4 highlighted words using context clues.' },
        ],
      },
      Writing: {
        contentStandards: [
          { code: '4.3', description: 'Communicate with appropriate language form and style' },
        ],
        learningStandards: [
          {
            code: '4.3.3',
            contentStandardCode: '4.3',
            contentStandardDesc: 'Appropriate language form and style',
            description: 'Produce a plan or draft of one or two paragraphs for a familiar topic and modify this appropriately in response to feedback.',
            focus: 'Drafting, peer editing, cohesive devices (Furthermore, In addition, However)',
          },
        ],
        tpDescriptors: {
          TP1: 'Can hardly write a coherent paragraph or organize ideas sequentially.',
          TP2: 'Can write simple paragraphs with repetitive sentence patterns and grammar errors.',
          TP3: 'Can produce a draft of two short paragraphs with acceptable cohesion and guidance.',
          TP4: 'Can write well-sequenced paragraphs using varied cohesive devices and correct tenses.',
          TP5: 'Can write creative stories or formal emails with rich descriptions and high accuracy.',
          TP6: 'Can write polished, compelling compositions showcasing sophisticated vocabulary and flawless organization.',
        },
        recommendedInterventions: [
          {
            title: 'Draft & Polish: The Two-Paragraph Model',
            learningStandardCode: '4.3.3',
            targetTP: 'TP3',
            description: 'Interactive outline template for introduction, development, and conclusion.',
            activities: ['Paragraph sequencing jigsaw', 'Peer editing rubric run', 'Digital canvas essay'],
          },
        ],
        sampleTasks: [
          { title: 'My Unforgettable Trip Composition', standardCode: '4.3.3', description: 'Write an 80-100 word two-paragraph recount of an eventful vacation.' },
        ],
      },
    },
  },

  // ===================== YEAR 6 =====================
  6: {
    year: 6,
    cefrLevel: 'A2 Mid to High (KSSR Semakan Aligned)',
    curriculumFramework: 'DSKP KSSR Semakan Tahun 6 (CEFR Aligned)',
    themes: ['World of Self, Family and Friends', 'World of Stories', 'World of Knowledge'],
    skills: {
      Listening: {
        contentStandards: [
          { code: '1.2', description: 'Understand meaning in a variety of familiar contexts' },
        ],
        learningStandards: [
          {
            code: '1.2.1',
            contentStandardCode: '1.2',
            contentStandardDesc: 'Understand meaning in familiar contexts',
            description: 'Understand with little or no support the main idea of longer simple texts on a range of familiar topics.',
            focus: 'Synthesizing main ideas and evaluating viewpoints in extended audio',
          },
        ],
        tpDescriptors: {
          TP1: 'Can hardly identify main ideas in extended spoken narratives or dialogues.',
          TP2: 'Can understand main ideas only with constant repetition, translation, and simplification.',
          TP3: 'Can understand main ideas of longer simple texts on familiar topics with minimal support.',
          TP4: 'Can extract main ideas and supporting details independently from authentic audio sources.',
          TP5: 'Can interpret complex listening texts, speaker intent, and subtle humor accurately.',
          TP6: 'Can demonstrate near-native listening comprehension across academic and daily contexts.',
        },
        recommendedInterventions: [
          {
            title: 'Master Listener: Key Idea Extraction',
            learningStandardCode: '1.2.1',
            targetTP: 'TP3',
            description: 'Listening to documentary narrations and identifying thesis sentences and supporting facts.',
            activities: ['TED-Ed style listening sheet', 'Audio contradiction detector', 'Speed summary recorder'],
          },
        ],
        sampleTasks: [
          { title: 'Space Exploration Audio Documentary', standardCode: '1.2.1', description: 'Listen to 3-minute Mars mission audio and identify 3 key engineering obstacles.' },
        ],
      },
      Speaking: {
        contentStandards: [
          { code: '2.1', description: 'Communicate simple information intelligibly' },
        ],
        learningStandards: [
          {
            code: '2.1.1',
            contentStandardCode: '2.1',
            contentStandardDesc: 'Communicate simple information intelligibly',
            description: 'Give detailed information about themselves and others, expressing viewpoints with justification.',
            focus: 'Extended spoken discourse, presentation delivery, and fluent interaction',
          },
        ],
        tpDescriptors: {
          TP1: 'Can hardly express viewpoints or deliver spoken information with acceptable fluency.',
          TP2: 'Can deliver brief spoken statements with frequent pauses and limited vocabulary.',
          TP3: 'Can give detailed personal information and express simple viewpoints with guidance.',
          TP4: 'Can communicate fluently with good sentence variety, accurate pronunciation, and clear reasoning.',
          TP5: 'Can deliver polished presentations, handle spontaneous questions, and speak persuasively.',
          TP6: 'Can exhibit exceptional public speaking flair, native-like pronunciation, and lead debates.',
        },
        recommendedInterventions: [
          {
            title: 'Public Speaker Studio: The 2-Minute Talk',
            learningStandardCode: '2.1.1',
            targetTP: 'TP3',
            description: 'Structured vocal projection and idea sequencing exercises with Milo AI coach.',
            activities: ['Impromptu 1-minute topic', 'Pronunciation rhythm check', 'Presentation video submission'],
          },
        ],
        sampleTasks: [
          { title: 'My Future Ambition Presentation', standardCode: '2.1.1', description: 'Deliver a 90-second speech about your future career and how you will serve society.' },
        ],
      },
      Reading: {
        contentStandards: [
          { code: '3.2', description: 'Understand a variety of linear and non-linear print and digital texts' },
        ],
        learningStandards: [
          {
            code: '3.2.2',
            contentStandardCode: '3.2',
            contentStandardDesc: 'Understand texts by using reading strategies',
            description: 'Understand specific information and details of simple longer texts (200+ words).',
            focus: 'Critical reading, inferring tone, comparing two different texts',
          },
        ],
        tpDescriptors: {
          TP1: 'Can hardly comprehend extended texts or answer inferential questions.',
          TP2: 'Can answer simple literal questions with assistance but misses nuanced text connections.',
          TP3: 'Can understand specific information and details in longer texts with minimal guidance.',
          TP4: 'Can read complex informational and literary texts independently with high accuracy.',
          TP5: 'Can evaluate text credibility, synthesize information from multiple sources, and analyze metaphors.',
          TP6: 'Can demonstrate consummate reading comprehension and critical literary analysis.',
        },
        recommendedInterventions: [
          {
            title: 'Critical Thinking Reading Workshop',
            learningStandardCode: '3.2.2',
            targetTP: 'TP3',
            description: 'Comparative reading between two articles on climate change with Venn diagrams.',
            activities: ['Venn diagram article match', 'Inferential question sprint', 'Author purpose analysis'],
          },
        ],
        sampleTasks: [
          { title: 'Ancient Civilizations Article', standardCode: '3.2.2', description: 'Read text on ancient pyramids and answer 5 higher-order thinking questions.' },
        ],
      },
      Writing: {
        contentStandards: [
          { code: '4.2', description: 'Communicate basic information intelligibly for a range of purposes' },
        ],
        learningStandards: [
          {
            code: '4.2.3',
            contentStandardCode: '4.2',
            contentStandardDesc: 'Communicate basic information intelligibly',
            description: 'Narrate factual and imagined events and experiences with structured beginning, middle, and ending.',
            focus: 'Multi-paragraph narrative and factual essays (100-150 words)',
          },
        ],
        tpDescriptors: {
          TP1: 'Can hardly organize a multi-paragraph narrative or maintain grammatical coherence.',
          TP2: 'Can write simple paragraphs with repetitive sentence beginnings and frequent errors.',
          TP3: 'Can narrate events with clear plot structure and appropriate tenses with guidance.',
          TP4: 'Can write engaging narratives or factual essays with good cohesion, descriptive adverbs, and adjectives.',
          TP5: 'Can craft well-paced, vivid compositions showcasing figurative language and mature vocabulary.',
          TP6: 'Can produce masterfully crafted essays with sophisticated narrative techniques, pacing, and flawless syntax.',
        },
        recommendedInterventions: [
          {
            title: 'Narrative Master: Plot Mountain & Show Don\'t Tell',
            learningStandardCode: '4.2.3',
            targetTP: 'TP3',
            description: 'Sensory writing exercises replacing "telling" with descriptive action verbs.',
            activities: ['Plot mountain organizer', 'Sensory word bank builder', 'Peer story critique'],
          },
        ],
        sampleTasks: [
          { title: 'An Unexpected Adventure Essay', standardCode: '4.2.3', description: 'Write a 120-word three-paragraph story about getting lost in an unfamiliar town.' },
        ],
      },
    },
  },
};

export const getDskpForYear = (year: number): DskpYearCurriculum => {
  const normalizedYear = Math.max(1, Math.min(6, year || 4));
  return DSKP_CURRICULUM_YEARS[normalizedYear] || DSKP_CURRICULUM_YEARS[4];
};

export const getLearningStandardsForYearAndSkill = (
  year: number,
  skill: SkillType
): DskpLearningStandard[] => {
  const yearData = getDskpForYear(year);
  return yearData.skills[skill]?.learningStandards || [];
};

export const getDskpTpDescriptor = (
  year: number,
  skill: SkillType,
  tp: TPLevel
): string => {
  const yearData = getDskpForYear(year);
  return (
    yearData.skills[skill]?.tpDescriptors[tp] ||
    `Tahap Penguasaan ${tp} selaras standard DSKP KSSR Semakan Bahasa Inggeris.`
  );
};

export const getDskpInterventionsForYear = (year: number, skill: SkillType) => {
  const yearData = getDskpForYear(year);
  return yearData.skills[skill]?.recommendedInterventions || [];
};
