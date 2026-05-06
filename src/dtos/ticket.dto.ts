export type TicketPriority = 'Низький' | 'Середній' | 'Високий';

export interface CreateTicketDto {
    authorId: string;
    subject: string;
    statusId: string;
    priority: TicketPriority;
    message: string;
}

export interface UpdateTicketDto extends Partial<CreateTicketDto> {}

export interface TicketResponseDto extends CreateTicketDto {
    id: string;
    
}