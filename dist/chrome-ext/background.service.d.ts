/// <reference types="socket.io-client" />
interface Message {
    type: string;
    content: any;
}
export default class BackgroundService {
    tabsLoaded: Map<number, boolean>;
    socket: SocketIOClient.Socket;
    start(): Promise<void>;
    onContentMessage(tabId: number, message: Message): void;
    respond(response: any): void;
    sendMessage(tabId: number, message: any): void;
    log(message: any): void;
    createTab(_: any, callback: (data?: any) => void): void;
    load(params: any, callback: (data?: any) => void): void;
    screenshot(_: any, callback: (data?: any) => void): void;
}
export {};
