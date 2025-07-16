import { User } from "../types";
export declare class Auth {
    static hashPassword(password: string): Promise<string>;
    static comparePassword(password: string, hashedPassword: string): Promise<boolean>;
    static generateToken(user: Omit<User, "password">): string;
    static verifyToken(token: string): any;
    static extractTokenFromHeader(authHeader: string): string | null;
}
//# sourceMappingURL=auth.d.ts.map