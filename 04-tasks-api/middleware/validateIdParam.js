import { validateId } from '../utils/validators.js';
import sendError from '../utils/sendError.js';

export const validateIdParam = (req, res, next) =>{
    const result = validateId(req.params.id);

    if(!result.valid){
        return sendError(res, 400, result.message);
    }

    next();
}