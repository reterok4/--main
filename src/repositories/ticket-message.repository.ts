import { TicketMessageResponseDto } from '../dtos/ticket-message.dto';

class TicketMessageRepository {
    private messages: TicketMessageResponseDto[] = [];

    getAllByTicketId(ticketId: string): TicketMessageResponseDto[] {
        
        return this.messages
            .filter(m => m.ticketId === ticketId)
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }

    getById(id: string): TicketMessageResponseDto | undefined {
        return this.messages.find(m => m.id === id);
    }

    create(message: TicketMessageResponseDto): TicketMessageResponseDto {
        this.messages.push(message);
        return message;
    }

    update(id: string, text: string): TicketMessageResponseDto | null {
        const index = this.messages.findIndex(m => m.id === id);
        if (index === -1) return null;
        
        this.messages[index] = { 
            ...this.messages[index], 
            text, 
            updatedAt: new Date() 
        };
        return this.messages[index];
    }

    delete(id: string): boolean {
        const index = this.messages.findIndex(m => m.id === id);
        if (index === -1) return false;
        this.messages.splice(index, 1);
        return true;
    }
}

export default new TicketMessageRepository();