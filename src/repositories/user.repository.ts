import { UserResponseDto } from '../dtos/user.dto';

class UserRepository {
    private users: UserResponseDto[] = [];

    getAll(): UserResponseDto[] {
        return this.users;
    }

    getById(id: string): UserResponseDto | undefined {
        return this.users.find(u => u.id === id);
    }

    getByEmail(email: string): UserResponseDto | undefined {
        return this.users.find(u => u.email === email);
    }

    create(user: UserResponseDto): UserResponseDto {
        this.users.push(user);
        return user;
    }

    update(id: string, data: Partial<UserResponseDto>): UserResponseDto | null {
        const index = this.users.findIndex(u => u.id === id);
        if (index === -1) return null;
        this.users[index] = { ...this.users[index], ...data };
        return this.users[index];
    }

    delete(id: string): boolean {
        const index = this.users.findIndex(u => u.id === id);
        if (index === -1) return false;
        this.users.splice(index, 1);
        return true;
    }
}

export default new UserRepository();