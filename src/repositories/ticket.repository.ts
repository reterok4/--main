import { TicketResponseDto } from '../dtos/ticket.dto';

class TicketRepository {
    private tickets: TicketResponseDto[] = [];

    getAll(): TicketResponseDto[] {
        return this.tickets;
    }

    getById(id: string): TicketResponseDto | undefined {
        return this.tickets.find(t => t.id === id);
    }

    create(ticket: TicketResponseDto): TicketResponseDto {
        this.tickets.push(ticket);
        return ticket;
    }

    update(id: string, data: Partial<TicketResponseDto>): TicketResponseDto | null {
        const index = this.tickets.findIndex(t => t.id === id);
        if (index === -1) return null;
        this.tickets[index] = { ...this.tickets[index], ...data };
        return this.tickets[index];
    }

    delete(id: string): boolean {
        const index = this.tickets.findIndex(t => t.id === id);
        if (index === -1) return false;
        this.tickets.splice(index, 1);
        return true;
    }
}

export default new TicketRepository();