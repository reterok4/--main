import { v4 as uuidv4 } from 'uuid';
import repo from '../repositories/status.repository';
import { CreateStatusDto, UpdateStatusDto, StatusResponseDto } from '../dtos/status.dto';
import { ApiError } from '../utils/ApiError';

class StatusService {
    private validate(dto: any) {
        const errors = [];
        if (!dto.name || dto.name.length < 2) {
            errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
        }

        const hexRegex = /^#([0-9A-F]{3}){1,2}$/i;
        if (dto.colorCode && !hexRegex.test(dto.colorCode)) {
            errors.push({ field: 'colorCode', message: 'Invalid HEX color code' });
        }
        return errors;
    }

    getAll(): StatusResponseDto[] {
        return repo.getAll();
    }

    getById(id: string) {
        const status = repo.getById(id);
        if (!status) throw new ApiError(404, 'NOT_FOUND', 'Status not found');
        return status;
    }

    create(dto: CreateStatusDto): StatusResponseDto {
        const errors = this.validate(dto);
        if (errors.length > 0) throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid status data', errors);
        if (repo.getByName(dto.name)) {
            throw new ApiError(409, 'CONFLICT', 'Status with this name already exists');
        }

        return repo.create({ id: uuidv4(), ...dto });
    }

    update(id: string, dto: UpdateStatusDto) {
        if (dto.name) {
            const existing = repo.getByName(dto.name);
            if (existing && existing.id !== id) {
                throw new ApiError(409, 'CONFLICT', 'Status name already in use');
            }
        }

        const updated = repo.update(id, dto);
        if (!updated) throw new ApiError(404, 'NOT_FOUND', 'Status not found');
        return updated;
    }

    delete(id: string) {
        const success = repo.delete(id);
        if (!success) throw new ApiError(404, 'NOT_FOUND', 'Status not found');
    }
}

export default new StatusService();