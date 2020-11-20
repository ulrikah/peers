export interface Message {
    type: string;
    timestamp: Date;
    id?: string;
    origin?: string;
    target?: string;
    initiator?: boolean;
    signal?: string;
}

export default Message;
