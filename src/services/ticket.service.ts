import { v4 as uuidv4 } from 'uuid';
import repo from '../repositories/ticket.repository';
import { CreateTicketDto, TicketResponseDto, UpdateTicketDto } from '../dtos/ticket.dto';
import { ApiError } from '../utils/ApiError';

class TicketService {
    private validate(dto: any) {
        const errors = [];
        if (!dto.author || dto.author.length < 3) errors.push({ field: 'author', message: 'Min 3 chars' });
        if (!dto.subject) errors.push({ field: 'subject', message: 'Required' });
        if (dto.message && dto.message.length < 5) errors.push({ field: 'message', message: 'Min 5 chars' });
        return errors;
    }

    getAll(status?: string, sort?: 'asc' | 'desc'): TicketResponseDto[] {
        let items = repo.getAll();
        
        // 5.1 Фільтрація
        if (status) items = items.filter(t => t.status === status);

        // 5.3 Сортування
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
        
        return repo.create({ id: uuidv4(), ...dto });
    }

    update(id: string, dto: UpdateTicketDto) {
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