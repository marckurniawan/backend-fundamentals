import jwt from 'jsonwebtoken';
import sendError from '../utils/sendError.js';

export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if(!authHeader ||!authHeader.startsWith('Bearer ')){
        return sendError(res, 401, 'Authentication required');
    }
    const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.id;

            next();

        } catch (error) {
            return res.status(401).json({
                error: 'Invalid or expired token'
            });
        }
};

