import { Message } from "../types";
export declare class BotService {
    private static bots;
    private static responseTimeouts;
    static initialize(): Promise<void>;
    private static createDummyUsers;
    private static setupBotResponses;
    static handleMessage(message: Message, io: any): Promise<void>;
    private static getRandomResponse;
    static isBotUser(userId: string): Promise<boolean>;
    static getBotUsers(): Promise<string[]>;
}
//# sourceMappingURL=botService.d.ts.map