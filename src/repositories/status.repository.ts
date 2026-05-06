import { StatusResponseDto } from '../dtos/status.dto';

class StatusRepository {
    private statuses: StatusResponseDto[] = [
        { id: '1', name: 'Новий', colorCode: '#2196F3' },
        { id: '2', name: 'В прогресі', colorCode: '#FF9800' },
        { id: '3', name: 'Вирішений', colorCode: '#4CAF50' },
        { id: '4', name: 'Закритий', colorCode: '#9E9E9E' }
    ];

    getAll(): StatusResponseDto[] {
        return this.statuses;
    }

    getById(id: string): StatusResponseDto | undefined {
        return this.statuses.find(s => s.id === id);
    }

    getByName(name: string): StatusResponseDto | undefined {
        return this.statuses.find(s => s.name.toLowerCase() === name.toLowerCase());
    }

    create(status: StatusResponseDto): StatusResponseDto {
        this.statuses.push(status);
        return status;
    }

    update(id: string, data: Partial<StatusResponseDto>): StatusResponseDto | null {
        const index = this.statuses.findIndex(s => s.id === id);
        if (index === -1) return null;
        this.statuses[index] = { ...this.statuses[index], ...data };
        return this.statuses[index];
    }

    delete(id: string): boolean {
        const index = this.statuses.findIndex(s => s.id === id);
        if (index === -1) return false;
        this.statuses.splice(index, 1);
        return true;
    }
}

export default new StatusRepository();