import * as Nodes from "./nodes";
import { FragmentLexer, Lexer } from "./lexer";

export class FragmentParser {
    fragment: string;

    constructor(fragment: string) {
        this.fragment = fragment;
    }

    parse(): Nodes.MarkdownNode[] {
        if (this.fragment == "" || !this.fragment.replace(/\s/g, '').length)
            return [];

        var result: Nodes.MarkdownNode[] = [];
        var lexer = new FragmentLexer(this.fragment);

        let char: string | undefined | null;
        let content: string = "";
        let hasTerminated: boolean = false;
        let rewindCount = 0;

        while ((char = lexer.next()) !== null) {
            content = "";
            hasTerminated = false;

            if (char == '\u002A' && lexer.peakNext() == '\u002A') {
                lexer.next();
                rewindCount = 2;

                let nestedChar: string | null = "";
                while ((nestedChar = lexer.next()) != null) {
                    rewindCount++;

                    if (nestedChar == '\u002A' && lexer.peakNext() == '\u002A') {
                        lexer.next();
                        hasTerminated = true;
                        break;
                    } else {
                        content += nestedChar;
                    }
                }

                if (hasTerminated === true) {
                    if (content.length > 0) {
                        result.push(new Nodes.BoldNode(content));
                    }

                    continue;
                } else {
                    lexer.rewindCharacters(rewindCount);
                }
            } else if (char == '\u002A' && lexer.peakNext() != '\u002A') {
                let content: string = "";
                let hasTerminated: boolean = false;
                let rewindCount = 1;

                let nestedChar: string | null = "";
                while ((nestedChar = lexer.next()) != null) {
                    rewindCount++;

                    if (nestedChar == '\u002A' && lexer.peakNext() != '\u002A') {
                        lexer.next();
                        hasTerminated = true;
                        break;
                    } else {
                        content += nestedChar;
                    }
                }

                if (hasTerminated === true) {
                    if (content.length > 0) {
                        result.push(new Nodes.ItalicNode(content));
                    }

                    continue;
                } else {
                    lexer.rewindCharacters(rewindCount);
                }
            } else if (char == '\u0060') {
                let content: string = "";
                let hasTerminated: boolean = false;
                let rewindCount = 1;

                let nestedChar: string | null = "";
                while ((nestedChar = lexer.next()) != null) {
                    rewindCount++;

                    if (nestedChar == '\u0060') {
                        hasTerminated = true;
                        break;
                    } else {
                        content += nestedChar;
                    }
                }

                if (hasTerminated === true) {
                    if (content.length > 0) {
                        result.push(new Nodes.CodeNode(content));
                    }

                    continue;
                } else {
                    lexer.rewindCharacters(rewindCount);
                }
            }

            let lastNode = result[result.length - 1];
            if (lastNode && lastNode.nodeType == "TextNode") {
                let lastNodeInstance = lastNode as Nodes.TextNode;
                result[result.length - 1] = new Nodes.TextNode(lastNodeInstance.text + String(char));
            } else {
                result.push(new Nodes.TextNode(String(char)));
            }
        }
        return result;
    }
}

export class BlockParser {
    block: string;

    constructor(text: string) {
        this.block = text;
    }

    parse(): Nodes.MarkdownNode[] {
        var lexer = Lexer.init(this.block, "\n");
        if (!lexer)
            return [];

        var result: Nodes.MarkdownNode[] = [];

        let fragment: string | undefined | null;
        while ((fragment = lexer?.next()) !== null) {
            fragment = fragment.trim();

            if (fragment.startsWith("\u0023")) {
                let content = fragment.replace(/\u0023/g, '').trim();
                let headingLevel = (fragment.length - content.length) - 1

                result.push(new Nodes.HeadingNode(content, headingLevel));
                continue;
            }

            let fragments = new FragmentParser(fragment.trim()).parse();
            if (fragments.length > 0)
                result.push(new Nodes.ParagraphNode(fragments));
        }

        return result;
    }
}

export class TypedParser {
    text: string = "";

    constructor() { }

    parse(text: string): Nodes.MarkdownNode[] {
        this.text = text;
        if (!this.text)
            return [];

        let lexer = Lexer.init(text.trim(), "\n\n");
        var result: Nodes.MarkdownNode[] = [];

        let block: string | null | undefined = "";
        while ((block = lexer?.next()) !== null) {
            if (block == '\u002D\u002D\u002D') {
                result.push(new Nodes.HorizontalRule());
                continue;
            }

            let blocks = new BlockParser(block || "").parse();
            if (blocks.length > 0)
                result.push(...blocks);
        }

        return result;
    }
}