import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
export declare class SocketService {
    private io;
    private connectedUsers;
    constructor(server: HTTPServer);
    private setupMiddleware;
    private setupEventHandlers;
    private getRoomId;
    getIO(): SocketIOServer;
}
//# sourceMappingURL=socket.d.ts.map