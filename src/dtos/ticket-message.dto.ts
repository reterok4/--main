export interface CreateTicketMessageDto {
    ticketId: string;
    authorId: string;
    text: string;
}

export interface UpdateTicketMessageDto {
    text: string;
}

export interface TicketMessageResponseDto extends CreateTicketMessageDto {
    id: string;
    createdAt: Date;
    updatedAt?: Date;
}