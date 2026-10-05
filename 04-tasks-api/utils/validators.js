export const validateTitle = (title) => {
    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
        return { valid: false, message: 'Title is required' };
    }
    return { valid: true };
};

export const validateUrgency = (urgency) => {
    const allowedUrgencies = ['low', 'medium', 'high'];
    if (urgency !== undefined &&
        !allowedUrgencies.includes(urgency)){
            return {valid: false, message: 'Urgency must be low, medium, or high'};        
        }
    return {valid: true};
}

export const validateStatus = (status) => {
    const allowedStatuses = ['pending', 'in-progress', 'completed'];
    if(status !== undefined && 
       !allowedStatuses.includes(status)){
        return  {valid: false, message: 'Status must be pending, in-progress, or completed'};
    }  
    return {valid: true}; 
}


export const validateDeadline = (deadline) => {
    if(deadline !== undefined && deadline !== null){
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(deadline)) {
                return {valid: false, message: 'Deadline must be a valid date in YYYY-MM-DD format'};
            }
        const [year, month, day] = deadline.split('-').map(Number);
        const parsedDate = new Date(deadline);

        const isValidDate = 
            parsedDate.getUTCFullYear() === year &&
            parsedDate.getUTCMonth() + 1 === month &&
            parsedDate.getUTCDate() === day;

        if (!isValidDate) {
            return {valid: false, message: 'Deadline is not a valid calendar date'};
        }
    }
    return {valid: true};
}


export const validateEmail = (email) => {
if (typeof email !== 'string') {
        return {valid: false,message: 'Email must be a string'};
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return {valid: false, message: 'Invalid email format'};
        }
    return {valid: true};
}

export const validateUsername = (username) => {
    if (typeof username !== 'string') {
        return {valid: false,message: 'Username must be a string'};
    }
    const usernameRegex = /^(?=.*[a-zA-Z0-9])[a-zA-Z0-9_]{3,25}$/;
        if(!usernameRegex.test(username)){
            return {valid: false, message: 'Invalid username format'};
        }
    return {valid: true};
}

export const validatePassword = (password) => {
    if (typeof password !== 'string') {
        return {valid: false,message: 'Password must be a string'};
    }
    
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,25}$/;
    if(!passwordRegex.test(password)){
        return {valid : false, message: 'Password must be 8-25 characters long and contain at least 1 letter, 1 number, and 1 special character'};
    }
    return {valid: true};
} 

const MAX_ID = 2147483647;

export const validateId = (id) => { 
    if(typeof id !== 'string'){
        return {valid: false, message: 'ID must be a string'};
    }
    
    const idRegex = /^[1-9]\d*$/;
    if(!idRegex.test(id)){
        return {valid: false, message: 'ID must be a positive integer'};
    }
    if(Number(id) > MAX_ID ){
        return {valid: false, message: `ID must not exceed ${MAX_ID}`};
    }
    return {valid: true};
}