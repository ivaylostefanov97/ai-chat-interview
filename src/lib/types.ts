export type Role = "user" | "assistant";

export interface ChatMessage {
	id: string;
	role: Role;
	content: string;
	status: "pending" | "success" | "error";
}

export interface ChatState {
	messages: ChatMessage[];
	isStreaming: boolean;
	input: string;
}


