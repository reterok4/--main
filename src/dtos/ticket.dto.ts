export type TicketPriority = 'Low' | 'Medium' | 'High';

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
    createdAt: Date;
}