export interface Message {
    type: string;
    timestamp: string;
    id?: string;
    origin?: string;
    target?: string;
    initiator?: boolean;
    signal?: string;
    message?: string;
}

export default Message;
