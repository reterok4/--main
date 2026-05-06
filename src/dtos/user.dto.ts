export type UserRole = 'Admin' | 'Client' | 'Support';

export interface CreateUserDto {
    name: string;
    email: string;
    role: UserRole;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {}

export interface UserResponseDto extends CreateUserDto {
    id: string;
    createdAt: Date;
}