import { ScriptLine } from '../components/Script';

export interface ScriptData {
  id: string;
  title: string;
  movie: string;
  year: number;
  character: string;
  lines: ScriptLine[];
  videoUrl?: string; // Added for reference video
}

export const scriptData: ScriptData[] = [
  {
    id: 'don-dialogue-1',
    title: "Don Ko Pakadna Mushkil Hi Nahin, Namumkin Hai",
    movie: 'Don',
    year: 1978,
    character: 'Don',
    videoUrl: '/AMITABH%20BACHAN%20ORIGINAL%20DON%20DIALOGUE%20MOVIE%20DON%20KO%20PAKADNA%20MUSHKIL%20HI%20NAHI%20NAMUMKIN%20HAI.mp4',
    lines: [
      {
        id: '1',
        character: 'Don',
        text: "Don ko pakadna mushkil hi nahin, namumkin hai!",
        isUserCharacter: true
      }
    ]
  },
  {
    id: 'godfather-1',
    title: "I'm Gonna Make Him an Offer",
    movie: 'The Godfather',
    year: 1972,
    character: 'Don Vito Corleone',
    lines: [
      {
        id: '1',
        character: 'Bonasera',
        text: 'I believe in America. America has made my fortune. And I raised my daughter in the American fashion. I gave her freedom but I taught her never to dishonor her family. She found a "boy friend," not an Italian. She went to the movies with him. She stayed out late. I didn\'t protest. Two months ago he took her for a drive with another boy friend. They made her drink whiskey and then they tried to take advantage of her. She resisted. She kept her honor. So they beat her like an animal. When I went to the hospital her nose was broken, her jaw was shattered, held together by wire. She couldn\'t even weep because of the pain.',
        isUserCharacter: false
      },
      {
        id: '2',
        character: 'Don Vito Corleone',
        text: 'Why did you go to the police? Why didn\'t you come to me first?',
        isUserCharacter: true
      },
      {
        id: '3',
        character: 'Bonasera',
        text: 'What do you want of me? Tell me anything, but do what I beg you to do.',
        isUserCharacter: false
      },
      {
        id: '4',
        character: 'Don Vito Corleone',
        text: 'What is it that you want?',
        isUserCharacter: true
      },
      {
        id: '5',
        character: 'Bonasera',
        text: 'I want them dead.',
        isUserCharacter: false
      },
      {
        id: '6',
        character: 'Don Vito Corleone',
        text: 'That I cannot do.',
        isUserCharacter: true
      },
      {
        id: '7',
        character: 'Bonasera',
        text: 'I will give you anything you ask.',
        isUserCharacter: false
      },
      {
        id: '8',
        character: 'Don Vito Corleone',
        text: "I'm gonna make him an offer he can't refuse.",
        isUserCharacter: true
      }
    ]
  },
  {
    id: 'dark-knight-1',
    title: 'Why So Serious?',
    movie: 'The Dark Knight',
    year: 2008,
    character: 'Joker',
    lines: [
      {
        id: '1',
        character: 'Gambol',
        text: 'Give me one reason why I shouldn\'t have my boy here pull your head off.',
        isUserCharacter: false
      },
      {
        id: '2',
        character: 'Joker',
        text: 'How about a magic trick? I\'m gonna make this pencil disappear.',
        isUserCharacter: true
      },
      {
        id: '3',
        character: 'Gambol',
        text: 'Enough. You think you can steal from us and just walk away?',
        isUserCharacter: false
      },
      {
        id: '4',
        character: 'Joker',
        text: 'Yeah.',
        isUserCharacter: true
      },
      {
        id: '5',
        character: 'Chechen',
        text: 'I\'m putting the word out. Five hundred grand for this clown dead. A million alive, so I can teach him some manners first.',
        isUserCharacter: false
      },
      {
        id: '6',
        character: 'Joker',
        text: 'Let me tell you why I use a knife. Guns are too quick. You can\'t savor all the little emotions. You see, in their last moments, people show you who they really are. So in a way, I know your friends better than you ever did. Would you like to know which of them were cowards?',
        isUserCharacter: true
      },
      {
        id: '7',
        character: 'Gambol',
        text: 'I\'m gonna kill you!',
        isUserCharacter: false
      },
      {
        id: '8',
        character: 'Joker',
        text: 'Why so serious?',
        isUserCharacter: true
      }
    ]
  },
  {
    id: 'gone-with-wind-1',
    title: 'Frankly, My Dear',
    movie: 'Gone with the Wind',
    year: 1939,
    character: 'Rhett Butler',
    lines: [
      {
        id: '1',
        character: 'Scarlett O\'Hara',
        text: 'Rhett! Rhett, where are you going?',
        isUserCharacter: false
      },
      {
        id: '2',
        character: 'Rhett Butler',
        text: 'I\'m going to Charleston, back where I belong.',
        isUserCharacter: true
      },
      {
        id: '3',
        character: 'Scarlett O\'Hara',
        text: 'Please, please take me with you!',
        isUserCharacter: false
      },
      {
        id: '4',
        character: 'Rhett Butler',
        text: 'No, I\'m through with everything here. I want peace. I want to see if somewhere there isn\'t something left in life of charm and grace.',
        isUserCharacter: true
      },
      {
        id: '5',
        character: 'Scarlett O\'Hara',
        text: 'Oh, Rhett! Please don\'t go! You can\'t leave me! Please! I\'ll change. I promise I\'ll change. I can\'t think about that today. I\'ll think about that tomorrow. But if you go, where shall I go? What shall I do?',
        isUserCharacter: false
      },
      {
        id: '6',
        character: 'Rhett Butler',
        text: 'Frankly, my dear, I don\'t give a damn.',
        isUserCharacter: true
      }
    ]
  }
];
