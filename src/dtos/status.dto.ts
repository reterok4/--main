export interface CreateStatusDto {
    name: string;
    colorCode: string;
}

export interface UpdateStatusDto extends Partial<CreateStatusDto> {}

export interface StatusResponseDto extends CreateStatusDto {
    id: string;
}