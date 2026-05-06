import { Request, Response, NextFunction } from 'express';
import service from '../services/ticket-message.service';

class TicketMessageController {
    // Отримуємо повідомлення через query-параметр (напр. GET /api/messages?ticketId=123)
    getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { ticketId } = req.query;
            const items = service.getAllByTicket(ticketId as string);
            res.status(200).json({ items });
        } catch (e) { next(e); }
    }

    create(req: Request, res: Response, next: NextFunction) {
        try {
            const message = service.create(req.body);
            res.status(201).json(message);
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

export default new TicketMessageController();