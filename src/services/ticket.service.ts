import { v4 as uuidv4 } from 'uuid';
import repo from '../repositories/ticket.repository';
import { CreateTicketDto, TicketResponseDto, UpdateTicketDto } from '../dtos/ticket.dto';
import { ApiError } from '../utils/ApiError';
import userService from './user.service';
import statusService from './status.service';

class TicketService {
    private validate(dto: any) {
        const errors = [];
        if (!dto.authorId) errors.push({ field: 'authorId', message: 'Author ID is required' });
        if (!dto.subject) errors.push({ field: 'subject', message: 'Required' });
        if (!dto.statusId) errors.push({ field: 'statusId', message: 'Status ID is required' });
        if (dto.message && dto.message.length < 5) errors.push({ field: 'message', message: 'Min 5 chars' });
        return errors;
    }

    getAll(statusId?: string, sort?: 'asc' | 'desc'): TicketResponseDto[] {
        let items = repo.getAll();
        
        if (statusId) items = items.filter(t => t.statusId === statusId);

        if (sort) {
            const weights = { 'Low': 1, 'Medium': 2, 'High': 3 };
            items.sort((a, b) => {
                const diff = weights[a.priority] - weights[b.priority];
                return sort === 'asc' ? diff : -diff;
            });
        }
        return items;
    }

    getById(id: string) {
        const ticket = repo.getById(id);
        if (!ticket) throw new ApiError(404, 'NOT_FOUND', 'Ticket not found');
        return ticket;
    }

    create(dto: CreateTicketDto): TicketResponseDto {
        const errors = this.validate(dto);
        if (errors.length > 0) throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid data', errors);
        
        try {
            userService.getById(dto.authorId);
        } catch {
            throw new ApiError(404, 'NOT_FOUND', 'Author not found');
        }
        try {
            statusService.getById(dto.statusId);
        } catch {
            throw new ApiError(404, 'NOT_FOUND', 'Status not found');
        }

        return repo.create({ 
            id: uuidv4(), 
            ...dto,
            createdAt: new Date()
        });
    }

    update(id: string, dto: UpdateTicketDto) {
        if (dto.authorId) {
            try { userService.getById(dto.authorId); } 
            catch { throw new ApiError(404, 'NOT_FOUND', 'Author not found'); }
        }
        if (dto.statusId) {
            try { statusService.getById(dto.statusId); } 
            catch { throw new ApiError(404, 'NOT_FOUND', 'Status not found'); }
        }

        const updated = repo.update(id, dto);
        if (!updated) throw new ApiError(404, 'NOT_FOUND', 'Ticket not found');
        return updated;
    }

    delete(id: string) {
        const success = repo.delete(id);
        if (!success) throw new ApiError(404, 'NOT_FOUND', 'Ticket not found');
    }
}

export default new TicketService();