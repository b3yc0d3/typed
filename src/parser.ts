import * as Nodes from "./nodes";
import { FragmentLexer, Lexer } from "./lexer";

export class FragmentParser {
    fragment: string;

    constructor(fragment: string) {
        this.fragment = fragment;
    }

    parse(): Array<Nodes.MarkdownNode> {
        if (this.fragment == "" || !this.fragment.replace(/\s/g, '').length)
            return [];

        var result: Array<Nodes.MarkdownNode> = [];
        var lexer = new FragmentLexer(this.fragment);

        let char: string | undefined | null;
        let content = "";
        let hasTerminated = false;
        var rewindCount = 0;

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
                rewindCount = 1;

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
                rewindCount = 1;

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
            } else if (char == '\u005B') {
                rewindCount = 1;

                let text = "";
                let url = "";

                let nestedChar: string | null;
                while ((nestedChar = lexer.next()) != null) {
                    rewindCount++;
                    if (nestedChar == '\u005D') {
                        hasTerminated = true;
                        break;
                    }
                    text += nestedChar;
                }

                if (hasTerminated == true && lexer.currentCharacter == '\u0028') {
                    hasTerminated = false;
                    lexer.next();
                    rewindCount++;

                    nestedChar = "";
                    while ((nestedChar = lexer.next()) != null) {
                        rewindCount++;
                        if (nestedChar == '\u0029') {
                            hasTerminated = true;
                            break;
                        }
                        url += nestedChar;
                    }

                    if (hasTerminated == true) {
                        const titleNodes = new FragmentParser(text).parse();

                        result.push(new Nodes.LinkNode(titleNodes, url));
                        continue;
                    }

                }

                lexer.rewindCharacters(rewindCount);
            } else if (char == '\u0021' && lexer.peakNext() == '\u005B') {
                lexer.next();
                rewindCount = 2;

                let text = "";
                let url = "";
                let nestedChar: string | null;
                while ((nestedChar = lexer.next()) != null) {
                    rewindCount++;
                    if (nestedChar == '\u005D') {
                        hasTerminated = true;
                        break;
                    }
                    text += nestedChar;
                }

                if (hasTerminated == true && lexer.currentCharacter == '\u0028') {
                    hasTerminated = false;
                    lexer.next();
                    rewindCount++;

                    nestedChar = "";
                    while ((nestedChar = lexer.next()) != null) {
                        rewindCount++;
                        if (nestedChar == '\u0029') {
                            hasTerminated = true;
                            break;
                        }
                        url += nestedChar;
                    }

                    if (hasTerminated == true) {
                        let titleNodes = new FragmentParser(text).parse();

                        result.push(new Nodes.ImageNode(titleNodes, url));
                        continue;
                    }

                }

                lexer.rewindCharacters(rewindCount);
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

    parse(): Array<Nodes.MarkdownNode> {
        var lexer = Lexer.init(this.block, "\n");
        var result: Array<Nodes.MarkdownNode> = [];

        let fragment: string | undefined | null;
        while ((fragment = lexer.next()) !== null) {
            fragment = fragment.trim();

            if (fragment.startsWith("\u0023")) {
                const text = fragment.replace(/\u0023/g, '').trim();
                const textNodes = new FragmentParser(text).parse();
                let headingLevel = (fragment.length - text.length) - 1;

                result.push(new Nodes.HeadingNode(textNodes, headingLevel));
                continue;
            } else if (fragment.trimStart().startsWith("\u003E")) {
                const text = fragment.replace(/^(\t|\s+)?>/g, '').trim();
                const textNodes = new FragmentParser(text).parse();
                const bqNode = new Nodes.BlockQuote(textNodes);

                let lastNode = result[result.length - 1];

                if (lastNode instanceof Nodes.BlockQuote) {
                    (result[result.length - 1] as Nodes.BlockQuote).textNodes.push(...textNodes);
                    continue;
                }

                result.push(bqNode);
                continue;
            }

            let fragments = new FragmentParser(fragment.trim()).parse();
            if (fragments.length > 0)
                result.push(...fragments);
        }

        return result;
    }
}

export class TypedParser {
    text: string = "";

    constructor() { }

    parse(text: string): Array<Nodes.MarkdownNode> {
        this.text = text;
        if (!this.text)
            return [];

        let lexer = Lexer.init(text.trim(), "\n\n");
        var result: Array<Nodes.MarkdownNode> = [];

        let block: string | null | undefined = "";
        while ((block = lexer.next()) !== null) {
            if (block == '\u002D\u002D\u002D') {
                result.push(new Nodes.HorizontalRule());
                continue;
            }

            let blocks = new BlockParser(block).parse();
            if (blocks.length > 0)
                result.push(...this.groupNodes(blocks));
        }

        return result;
    }

    /**
     * Groups MarkdownNodes to "Paragraphs" etc.
     * @param nodes List of MarkdownNodes
     * @returns List of grouped MarkdownNodes
     */
    private groupNodes(nodes: Array<Nodes.MarkdownNode>): Array<Nodes.MarkdownNode> {
        var result: Array<Nodes.MarkdownNode> = [];
        const getLastNode = (nl: Array<Nodes.MarkdownNode>): Nodes.MarkdownNode | null => {
            if (nl.length <= 0)
                return null;

            return nl[nl.length - 1];
        }

        for (let node of nodes) {
            let lastNode = getLastNode(result);

            switch (true) {
                case node instanceof Nodes.BlockQuote:
                case node instanceof Nodes.HeadingNode:
                    result.push(node);
                    continue;

                default:
                    if (!(lastNode instanceof Nodes.ParagraphNode)) {
                        result.push(new Nodes.ParagraphNode([node]));
                    } else {
                        lastNode.nodes.push(node);
                    }
                    break;
            }
        }

        return result;
    }
}