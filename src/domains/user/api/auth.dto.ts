import { User } from "@/domains/user/types/user.type";

export type AuthResponseDto = { user: User; message: string };
