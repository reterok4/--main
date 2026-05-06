import { Request, Response, NextFunction } from 'express';
import service from '../services/ticket.service';

class TicketController {
    getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { status, sort } = req.query;
            const items = service.getAll(status as string, sort as 'asc' | 'desc');
            res.status(200).json({ items });
        } catch (e) { next(e); }
    }

    getById(req: Request, res: Response, next: NextFunction) {
        try {
            res.status(200).json(service.getById(req.params.id));
        } catch (e) { next(e); }
    }

    create(req: Request, res: Response, next: NextFunction) {
        try {
            const ticket = service.create(req.body);
            res.status(201).json(ticket);
        } catch (e) { next(e); }
    }

    update(req: Request, res: Response, next: NextFunction) {
        try {
            res.status(200).json(service.update(req.params.id, req.body));
        } catch (e) { next(e); }
    }

    delete(req: Request, res: Response, next: NextFunction) {
        try {
            service.delete(req.params.id);
            res.status(204).send();
        } catch (e) { next(e); }
    }
}

export default new TicketController();