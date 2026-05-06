import { v4 as uuidv4 } from 'uuid';
import repo from '../repositories/ticket-message.repository';
import { CreateTicketMessageDto, UpdateTicketMessageDto, TicketMessageResponseDto } from '../dtos/ticket-message.dto';
import { ApiError } from '../utils/ApiError';

class TicketMessageService {
    private validate(dto: any) {
        const errors = [];
        if (!dto.ticketId) errors.push({ field: 'ticketId', message: 'Ticket ID is required' });
        if (!dto.authorId) errors.push({ field: 'authorId', message: 'Author ID is required' });
        if (!dto.text || dto.text.trim().length === 0) {
            errors.push({ field: 'text', message: 'Message text cannot be empty' });
        }
        return errors;
    }

    getAllByTicket(ticketId: string): TicketMessageResponseDto[] {
        if (!ticketId) throw new ApiError(400, 'BAD_REQUEST', 'Ticket ID is required');
        return repo.getAllByTicketId(ticketId);
    }

    create(dto: CreateTicketMessageDto): TicketMessageResponseDto {
        const errors = this.validate(dto);
        if (errors.length > 0) throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid message data', errors);

        return repo.create({
            id: uuidv4(),
            ...dto,
            createdAt: new Date()
        });
    }

    update(id: string, dto: UpdateTicketMessageDto) {
        if (!dto.text || dto.text.trim().length === 0) {
            throw new ApiError(400, 'VALIDATION_ERROR', 'Message text cannot be empty');
        }

        const updated = repo.update(id, dto.text);
        if (!updated) throw new ApiError(404, 'NOT_FOUND', 'Message not found');
        return updated;
    }

    delete(id: string) {
        const success = repo.delete(id);
        if (!success) throw new ApiError(404, 'NOT_FOUND', 'Message not found');
    }
}

export default new TicketMessageService();