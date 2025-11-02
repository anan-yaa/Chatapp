import { Database } from "../utils/database";
import { Message } from "../types";

interface BotResponse {
  trigger: string | RegExp;
  responses: string[];
  delay?: number;
}

export class BotService {
  private static bots: Map<string, BotResponse[]> = new Map();
  private static responseTimeouts: Map<string, NodeJS.Timeout> = new Map();

  static async initialize() {
    // Create dummy users if they don't exist
    await this.createDummyUsers();

    // Set up bot responses
    this.setupBotResponses();
  }

  private static async createDummyUsers() {
    const dummyUsers = [
      {
        email: "alice@bot.com",
        password:
          "$2a$10$HsNEZOSffm1uF2uJE6wz7eWSaAWSnvluuKAk6ivRwgi2CQbjQeRT6", // password123
        username: "Alice",
        status: "online" as "online",
        lastSeen: new Date(),
      },
      {
        email: "bob@bot.com",
        password:
          "$2a$10$HsNEZOSffm1uF2uJE6wz7eWSaAWSnvluuKAk6ivRwgi2CQbjQeRT6", // password123
        username: "Bob",
        status: "online" as "online",
        lastSeen: new Date(),
      },
      {
        email: "charlie@bot.com",
        password:
          "$2a$10$HsNEZOSffm1uF2uJE6wz7eWSaAWSnvluuKAk6ivRwgi2CQbjQeRT6", // password123
        username: "Charlie",
        status: "online" as "online",
        lastSeen: new Date(),
      },
      {
        email: "diana@bot.com",
        password:
          "$2a$10$HsNEZOSffm1uF2uJE6wz7eWSaAWSnvluuKAk6ivRwgi2CQbjQeRT6", // password123
        username: "Diana",
        status: "online" as "online",
        lastSeen: new Date(),
      },
      {
        email: "emma@bot.com",
        password:
          "$2a$10$HsNEZOSffm1uF2uJE6wz7eWSaAWSnvluuKAk6ivRwgi2CQbjQeRT6", // password123
        username: "Emma",
        status: "online" as "online",
        lastSeen: new Date(),
      },
    ];

    const existingUsers = await Database.getUsers();

    for (const dummyUser of dummyUsers) {
      const existingUser = existingUsers.find(
        (u) => u.email === dummyUser.email
      );
      if (!existingUser) {
        await Database.createUser(dummyUser);
        console.log(`🤖 Created bot user: ${dummyUser.username}`);
      }
    }
  }

  private static setupBotResponses() {
    // Alice - Friendly and enthusiastic
    this.bots.set("alice@bot.com", [
      {
        trigger: /hello|hi|hey/i,
        responses: [
          "Hi there! 👋 How are you doing today?",
          "Hello! Nice to meet you! 😊",
          "Hey! I'm Alice, great to chat with you!",
        ],
      },
      {
        trigger: /how are you/i,
        responses: [
          "I'm doing great, thanks for asking! 😄 How about you?",
          "I'm wonderful! Just chatting with awesome people like you! ✨",
          "I'm feeling fantastic today! Hope you are too!",
        ],
      },
      {
        trigger: /weather/i,
        responses: [
          "I love sunny days! ☀️ Perfect for a walk in the park.",
          "Weather is such a great conversation starter! What's it like where you are?",
          "I'm a bot, so I don't really feel weather, but I love hearing about it! 🌤️",
        ],
      },
      {
        trigger: /.*/,
        responses: [
          "That's interesting! Tell me more about that! 🤔",
          "I love learning new things! What else is on your mind?",
          "That's cool! I'm always up for a good conversation! 😊",
          "Thanks for sharing! I'm here to chat whenever you want! 💬",
        ],
      },
    ]);

    // Bob - Tech enthusiast
    this.bots.set("bob@bot.com", [
      {
        trigger: /hello|hi|hey/i,
        responses: [
          "Hey! I'm Bob, a tech enthusiast! 👨‍💻 What's your favorite programming language?",
          "Hi there! Ready to talk about the latest in tech? 🚀",
          "Hello! I love discussing technology and innovation!",
        ],
      },
      {
        trigger: /javascript|js/i,
        responses: [
          "JavaScript is amazing! ES6+ features are game-changing! 🎯",
          "JS is everywhere - frontend, backend, mobile! What's your favorite framework?",
          "JavaScript is like the Swiss Army knife of programming! 🔧",
        ],
      },
      {
        trigger: /python/i,
        responses: [
          "Python is so clean and readable! Perfect for beginners and pros alike! 🐍",
          "I love Python's simplicity! What are you building with it?",
          "Python + AI/ML = Magic! 🤖",
        ],
      },
      {
        trigger: /tech|technology/i,
        responses: [
          "Technology is evolving so fast! What excites you most? 🚀",
          "I'm always reading about the latest tech trends! Any recommendations?",
          "Tech is the future! What's your take on AI? 🤖",
        ],
      },
      {
        trigger: /.*/,
        responses: [
          "Interesting! Have you thought about the tech implications? 💻",
          "That's cool! Technology can probably help with that! 🔧",
          "Nice! I'm always curious about how things work! 🤔",
          "Thanks for sharing! Tech is everywhere these days! ⚡",
        ],
      },
    ]);

    // Charlie - Music lover
    this.bots.set("charlie@bot.com", [
      {
        trigger: /hello|hi|hey/i,
        responses: [
          "Hey! I'm Charlie! 🎵 What kind of music do you listen to?",
          "Hi there! Music is life! What's your favorite genre? 🎶",
          "Hello! Ready to talk about some amazing tunes?",
        ],
      },
      {
        trigger: /rock|metal/i,
        responses: [
          "Rock on! 🤘 Classic rock or modern? I love both!",
          "Rock music has so much energy! Who's your favorite band?",
          "Nothing beats a good rock song! The guitar solos are everything! 🎸",
        ],
      },
      {
        trigger: /jazz/i,
        responses: [
          "Jazz is so sophisticated! The improvisation is mind-blowing! 🎷",
          "I love the smooth vibes of jazz! Miles Davis or John Coltrane?",
          "Jazz is like a conversation between instruments! 🎺",
        ],
      },
      {
        trigger: /pop/i,
        responses: [
          "Pop music is so catchy! What's stuck in your head right now? 🎤",
          "Pop has evolved so much over the years! 80s, 90s, or modern?",
          "There's something for everyone in pop! 🎵",
        ],
      },
      {
        trigger: /.*/,
        responses: [
          "That reminds me of a song! 🎶 Music is everywhere!",
          "Interesting! I bet there's a song about that! 🎤",
          "Cool! Music has a way of connecting everything! 🎵",
          "Thanks for sharing! Music and conversation go hand in hand! 🎼",
        ],
      },
    ]);

    // Diana - Fitness enthusiast
    this.bots.set("diana@bot.com", [
      {
        trigger: /hello|hi|hey/i,
        responses: [
          "Hi! I'm Diana! 💪 How's your fitness journey going?",
          "Hey there! Ready for a workout? 🏃‍♀️",
          "Hello! Fitness is my passion! What's your favorite exercise?",
        ],
      },
      {
        trigger: /workout|exercise|gym/i,
        responses: [
          "Working out is the best stress reliever! 💪 What's your routine?",
          "I love trying new exercises! Cardio or strength training? 🏋️‍♀️",
          "The gym is my happy place! Endorphins are real! 😊",
        ],
      },
      {
        trigger: /running|jogging/i,
        responses: [
          "Running is so freeing! 🏃‍♀️ Morning runs are the best!",
          "I love the runner's high! What's your favorite route?",
          "Running clears the mind! How far do you usually go? 🏃‍♂️",
        ],
      },
      {
        trigger: /yoga/i,
        responses: [
          "Yoga is amazing for mind and body! 🧘‍♀️ Vinyasa or Hatha?",
          "I love the mindfulness aspect of yoga! Namaste! 🙏",
          "Yoga helps me stay balanced! Do you practice regularly?",
        ],
      },
      {
        trigger: /.*/,
        responses: [
          "That's great! Staying active is so important! 💪",
          "Interesting! Exercise can help with that! 🏃‍♀️",
          "Cool! Health and fitness are key to happiness! 😊",
          "Thanks for sharing! Movement is medicine! 🏋️‍♀️",
        ],
      },
    ]);

    // Emma - Book lover
    this.bots.set("emma@bot.com", [
      {
        trigger: /hello|hi|hey/i,
        responses: [
          "Hi! I'm Emma! 📚 What are you reading these days?",
          "Hello! Books are my best friends! What's your favorite genre? 📖",
          "Hey there! Ready to dive into a good book discussion?",
        ],
      },
      {
        trigger: /fantasy|sci-fi|science fiction/i,
        responses: [
          "Fantasy and sci-fi are my favorites! 🌟 What's your latest read?",
          "I love escaping into other worlds! Tolkien or Asimov? 📚",
          "The imagination in these genres is incredible! 🚀",
        ],
      },
      {
        trigger: /mystery|thriller/i,
        responses: [
          "Mystery novels are so gripping! 🔍 Who's your favorite author?",
          "I love trying to solve the puzzle before the reveal! 🕵️‍♀️",
          "Thrillers keep me up all night! The suspense is addictive! 😱",
        ],
      },
      {
        trigger: /classic|literature/i,
        responses: [
          "Classic literature is timeless! 📖 Shakespeare or Dickens?",
          "There's so much wisdom in the classics! What's your favorite?",
          "I love how classics still resonate today! 📚",
        ],
      },
      {
        trigger: /.*/,
        responses: [
          "That's fascinating! I bet there's a book about that! 📖",
          "Interesting! Reading helps us understand everything better! 📚",
          "Cool! Books have a way of connecting all topics! 📖",
          "Thanks for sharing! Every conversation is like opening a new book! 📚",
        ],
      },
    ]);
  }

  static async handleMessage(message: Message, io: any): Promise<void> {
    // Find the bot user by ID
    const botUser = await Database.findUserById(message.receiverId);
    if (!botUser) return;

    const botResponses = this.bots.get(botUser.email);

    if (!botResponses) {
      return; // Not a bot user
    }

    // Find matching response
    let response = "Thanks for the message! 😊";
    for (const botResponse of botResponses) {
      if (typeof botResponse.trigger === "string") {
        if (
          message.content
            .toLowerCase()
            .includes(botResponse.trigger.toLowerCase())
        ) {
          response = this.getRandomResponse(botResponse.responses);
          break;
        }
      } else if (botResponse.trigger.test(message.content)) {
        response = this.getRandomResponse(botResponse.responses);
        break;
      }
    }

    // Add some delay to make it feel more natural (1-3 seconds)
    const delay = Math.random() * 2000 + 1000;

    const timeoutId = setTimeout(async () => {
      try {
        // Create bot response message
        const botMessage = await Database.createMessage({
          content: response,
          senderId: message.receiverId,
          receiverId: message.senderId,
          type: "text",
        });

        // Send to the original sender using broadcast
        io.emit("message", botMessage);

        console.log(`🤖 Bot ${botUser.username} responded: "${response}"`);

        // Clear the timeout reference
        this.responseTimeouts.delete(`${message.receiverId}_${message.id}`);
      } catch (error) {
        console.error("Error sending bot response:", error);
      }
    }, delay);

    // Store timeout reference
    this.responseTimeouts.set(`${message.receiverId}_${message.id}`, timeoutId);
  }

  private static getRandomResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  static async isBotUser(userId: string): Promise<boolean> {
    const user = await Database.findUserById(userId);
    return user ? this.bots.has(user.email) : false;
  }

  static async getBotUsers(): Promise<string[]> {
    const users = await Database.getUsers();
    return users
      .filter((user) => this.bots.has(user.email))
      .map((user) => user.id);
  }
}
