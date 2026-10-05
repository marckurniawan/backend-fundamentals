import { validateDeadline, validateId, validateStatus, validateTitle, validateUrgency } from './validators.js';

describe('validateTitle', () => {
    test('rejects empty string', () => {
        const result = validateTitle('');
        expect(result.valid).toBe(false);
        expect(result.message).toBe('Title is required');
    });

    test('accepts a normal title', () => {
        const result = validateTitle('Belajar Jest');
        expect(result.valid).toBe(true);
    });

    test('rejects whitespace only', () =>{
        const result = validateTitle('  ');
        expect(result.valid).toBe(false);
        expect(result.message).toBe('Title is required');

    })

    test('rejects non-string', () => {
        const result = validateTitle(45);
        expect(result.valid).toBe(false);
        expect(result.message).toBe('Title is required');

    })

    test('accepts an undefined value', () => {
        const result = validateTitle();
        expect(result.valid).toBe(true)
    })
});


describe ('validateUrgency', () => {
    test('accepts low', () =>{
        const result = validateUrgency('low');
        expect(result.valid).toBe(true)
    })
        test('accepts medium', () => {
        const result = validateUrgency('medium');

        expect(result.valid).toBe(true);
    });

    test('accepts high', () => {
        const result = validateUrgency('high');

        expect(result.valid).toBe(true);
    });

        test('rejects invalid value', () => {
        const result = validateUrgency('urgent');

        expect(result.valid).toBe(false);
        expect(result.message).toBe('Urgency must be low, medium, or high');
    });

    test('rejects non-string value', () => {
        const result = validateUrgency(4);

        expect(result.valid).toBe(false);
        expect(result.message).toBe('Urgency must be low, medium, or high');
    })

    test('accepts an undefined value', () =>{
        const result = validateUrgency();
        
        expect(result.valid).toBe(true);
    })
})

describe('validateStatus', () => {
    test('accepts pending', () =>{
        const result = validateStatus('pending');
        expect(result.valid).toBe(true)
    })
        test('accepts in-progress', () => {
        const result = validateStatus('in-progress');

        expect(result.valid).toBe(true);
    });

    test('accepts completed', () => {
        const result = validateStatus('completed');

        expect(result.valid).toBe(true);
    });

        test('rejects invalid value', () => {
        const result = validateStatus('to be done ASAP');

        expect(result.valid).toBe(false);
        expect(result.message).toBe('Status must be pending, in-progress, or completed');
    });

    test('rejects non-string value', () => {
        const result = validateStatus(4);

        expect(result.valid).toBe(false);
        expect(result.message).toBe('Status must be pending, in-progress, or completed');
    })

    test('accepts an undefined value', () =>{
        const result = validateStatus();
        
        expect(result.valid).toBe(true);
    })
})

describe('validateDeadline', () => {
    test('rejects invalid date format', () => {
        const result = validateDeadline('07-08-2026');

        expect(result.valid).toBe(false);
        expect(result.message).toBe('Deadline must be a valid date in YYYY-MM-DD format');
    });

    test('rejects a non-string value', () => {
        const result = validateDeadline(782026);
        
        expect(result.valid).toBe(false);
        expect(result.message).toBe('Deadline must be a valid date in YYYY-MM-DD format');
    });

    test('rejects invalid date', () =>{
        const result = validateDeadline('2026-02-30');

        expect(result.valid).toBe(false);
        expect(result.message).toBe('Deadline is not a valid calendar date');
    });

    test('accepts valid date', () =>{
        const result = validateDeadline('2026-02-28');

        expect(result.valid).toBe(true);
    });

    test('accepts a null value', () => {
        const result = validateDeadline(null);
        
        expect(result.valid).toBe(true);
    });
    test('accepts an undefined value', () =>{
        const result = validateDeadline();
        
        expect(result.valid).toBe(true);
    });
})

describe('validateId', () => {
    test.each([
        '49',
        '2147483647'
    ])('accepts valid ID: %p', (id) => {
        const result = validateId(id);

        expect(result.valid).toBe(true);
    });

    test.each([
        '2147483648',
        '99999999999999999999',
        ':7',
        '',
        '1e3',
        '0x10',
        ' 7 ',
        'abc',
        '7\n',
        '045',
        '0',
        '-1',
        '1.5'
    ])('rejects invalid ID: %s', (id) => {
        const result = validateId(id);

        expect(result.valid).toBe(false);
    });

    test.each([
        undefined,
        7,
        null
    ])('rejects non-string or missing ID: %p', (id) => {
        const result = validateId(id);

        expect(result.valid).toBe(false);
    });
});