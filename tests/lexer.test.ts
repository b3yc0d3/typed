import { Lexer, FragmentLexer } from "../src/lexer";

describe("FragmentLexer", () => {
    test('should retrieve current character correctly', () => {
        const content = 'abc';
        const lexer = new FragmentLexer(content);
        expect(lexer.currentCharacter).toBe('a');
    });

    test('should move cursor to next character when calling next()', () => {
        const content = 'abc';
        const lexer = new FragmentLexer(content);
        lexer.next();
        expect(lexer.currentCharacter).toBe('b');
    });

    test('should return null when calling next() at the end', () => {
        const content = 'a';
        const lexer = new FragmentLexer(content);
        lexer.next();
        expect(lexer.next()).toBeNull();
    });

    test('should return the next character without moving the cursor when calling peakNext()', () => {
        const content = 'abc';
        const lexer = new FragmentLexer(content);
        lexer.peakNext();
        expect(lexer.currentCharacter).toBe('a');
    });

    test('should return the previous character without moving the cursor when calling peakNext()', () => {
        const content = 'abc';
        const lexer = new FragmentLexer(content);
        lexer.next();
        expect(lexer.peakPrevious()).toBe('a');
    });

    test('should return null when calling peakPrevious() at the start', () => {
        const content = 'abc';
        const lexer = new FragmentLexer(content);
        expect(lexer.peakPrevious()).toBeNull();
    });

    test('should rewind the cursor by one character when calling rewindCharacter()', () => {
        const content = 'abc';
        const lexer = new FragmentLexer(content);
        lexer.next();
        lexer.rewindCharacter();
        expect(lexer.currentCharacter).toBe('a');
    });

    test('should throw an error when attempting to rewind below zero', () => {
        const content = 'abc';
        const lexer = new FragmentLexer(content);
        expect(() => {
            lexer.rewindCharacter();
        }).toThrow();
    });

    test('should rewind the cursor by 2 character when calling rewindCharacters(2)', () => {
        const content = 'abc';
        const lexer = new FragmentLexer(content);
        lexer.next();
        lexer.next();
        lexer.rewindCharacters(2);
        expect(lexer.currentCharacter).toBe('a');
    });

    test('should throw an error when attempting to rewind below zero', () => {
        const content = 'abc';
        const lexer = new FragmentLexer(content);
        lexer.next();
        lexer.next();
        expect(() => {
            lexer.rewindCharacters(3);
        }).toThrow();
    });

})

describe('Lexer', () => {
    test('should throw an error if initialized without lexems', () => {
        expect(() => {
            new Lexer([]);
        }).toThrow();
    });

    test('should initialize correctly with lexems', () => {
        const lexems = ['foo', 'bar'];
        const lexer = new Lexer(lexems);
        expect(lexer.token).toBe('foo');
    });

    test('should tokenize expression string correctly', () => {
        const expression = 'foo bar baz';
        const splitter = ' ';
        const lexer = Lexer.init(expression, splitter);
        expect(lexer).not.toBeNull();
        expect(lexer?.token).toBe('foo');
    });

    test('should return null when calling next() at the end', () => {
        const lexer = new Lexer(['foo']);
        lexer.next();
        expect(lexer.next()).toBeNull();
    });

    test('should return true for isAtEnd() when at the end', () => {
        const lexer = new Lexer(['foo']);
        lexer.next();
        expect(lexer.isAtEnd).toBeTruthy();
    });

    test('should return false for isAtEnd() when not at the end', () => {
        const lexer = new Lexer(['foo', 'bar']);
        lexer.next();
        expect(lexer.isAtEnd).toBeFalsy();
    });
});