export type Role = "system" | "user" | "assistant" | "tool";

export interface ChatMessage {
	role: Role;
	content: string;
}

export interface ChatState {
	messages: ChatMessage[];
	isStreaming: boolean;
	input: string;
}


