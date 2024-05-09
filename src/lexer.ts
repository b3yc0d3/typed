export class Lexer {
    private lexems: string[] = [];
    private index: number = 0;

    /**
     * Create new Lexer for iterating the given lexems.
     * @param lexems Tokens to iterate
     */
    constructor(lexems: string[]) {
        if (!lexems.length) {
            throw new Error("Lexer should have at least one value");
        }
        this.lexems = lexems;
    }

    /**
     * Create new lexer by tokenizing the given expression string.
     * 
     * If the given expression is empty, or contains only empty characters
     * (such as spaces),`null` is returned, indicating no further parsing
     * is necessary.
     * 
     * @param expression Expression used to tokenize and lex
     * @param splitter Splitter used to tokenize
     * @returns New Lexer or `null`
     */
    static init(expression: string, splitter: string): Lexer | null {
        if (!splitter.length || !expression.length)
            return null;

        let lexems = expression.split(splitter);
        return new Lexer(lexems);
    }

    /**
     * Returns the currently selected lexem.
     * Does not modify the cursor position.
     */
    get token(): string {
        return this.lexems[this.index];
    }

    /**
     * Returns the currently selected lexem and moves the cursor to the nex position.
     * @returns 
     */
    next(): string | null {
        if (this.isAtEnd)
            return null;

        let token = this.lexems[this.index];
        this.index++;
        return token;
    }

    /**
     * Returns true if the end is reached, therefore all elements were iterated.
     */
    get isAtEnd(): boolean {
        return this.index >= this.lexems.length;
    }
}

export class FragmentLexer {
    content: string;
    offset: number = 0;

    constructor(content: string) {
        this.content = content;
    }

    get currentCharacter(): string | null {
        if (!(this.offset >= 0 && this.offset < this.content.length))
            return null;

        return this.content[this.offset];
    }

    peakPrevious(count: number = 1): string | null {
        if (this.offset - count < 0)
            return null;
        
        this.offset -= count;
        let char = this.currentCharacter;
        this.offset += count;
        return char;
    }

    next(): string | null {
        let char = this.currentCharacter;
        this.offset++;
        return char;
    }

    peakNext(): string | null {
        let char = this.next();
        this.rewindCharacter();
        return char;
    }

    rewindCharacter() {
        if (!(this.offset > 0))
            throw new Error("Do not rewind below zero!");

        this.offset--;
    }

    rewindCharacters(count: number) {
        if (count > this.offset)
            throw new Error("Do not rewind below zero!");
        this.offset -= count;
    }
}
