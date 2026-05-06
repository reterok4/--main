export type TicketStatus = 'New' | 'InProgress' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High';

export interface CreateTicketDto {
    author: string;
    subject: string;
    status: TicketStatus;
    priority: TicketPriority;
    message: string;
}

export interface UpdateTicketDto extends Partial<CreateTicketDto> {}

export interface TicketResponseDto extends CreateTicketDto {
    id: string;
}