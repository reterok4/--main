import { v4 as uuidv4 } from 'uuid';
import repo from '../repositories/user.repository';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dtos/user.dto';
import { ApiError } from '../utils/ApiError';

class UserService {
    private validate(dto: any) {
        const errors = [];
        if (!dto.name || dto.name.length < 2) errors.push({ field: 'name', message: 'Min 2 chars' });
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!dto.email || !emailRegex.test(dto.email)) {
            errors.push({ field: 'email', message: 'Valid email required' });
        }
        
        if (!dto.role) errors.push({ field: 'role', message: 'Role is required' });
        return errors;
    }

    getAll(): UserResponseDto[] {
        return repo.getAll();
    }

    getById(id: string) {
        const user = repo.getById(id);
        if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');
        return user;
    }

    create(dto: CreateUserDto): UserResponseDto {
        const errors = this.validate(dto);
        if (errors.length > 0) throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid user data', errors);
       
        const existingUser = repo.getByEmail(dto.email);
        if (existingUser) throw new ApiError(409, 'CONFLICT', 'Email already in use');

        return repo.create({ 
            id: uuidv4(), 
            ...dto,
            createdAt: new Date()
        });
    }

    update(id: string, dto: UpdateUserDto) {
        if (dto.email) {
            const existingUser = repo.getByEmail(dto.email);
            if (existingUser && existingUser.id !== id) {
                throw new ApiError(409, 'CONFLICT', 'Email already in use');
            }
        }

        const updated = repo.update(id, dto);
        if (!updated) throw new ApiError(404, 'NOT_FOUND', 'User not found');
        return updated;
    }

    delete(id: string) {
        const success = repo.delete(id);
        if (!success) throw new ApiError(404, 'NOT_FOUND', 'User not found');
    }
}

export default new UserService();