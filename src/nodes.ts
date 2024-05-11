export class MarkdownNode {
    constructor(public nodeType: string) { }
}

export class TextNode extends MarkdownNode {
    text: string;

    constructor(text: string) {
        super("TextNode");
        this.text = text;
    }
}

export class BoldNode extends TextNode {
    constructor(text: string) {
        super(text);
        this.nodeType = "BoldNode";
    }
}

export class ItalicNode extends TextNode {
    constructor(text: string) {
        super(text);
        this.nodeType = "ItalicNode";
    }
}

export class CodeNode extends TextNode {
    constructor(text: string) {
        super(text);
        this.nodeType = "CodeNode";
    }
}

export class LinkNode extends MarkdownNode {
    text: Array<MarkdownNode>;
    url: string;
    constructor(text: Array<MarkdownNode>, url: string) {
        super("LinkNode");

        this.text = text;
        this.url = url;
    }
}

export class ImageNode extends LinkNode {
    constructor(text: Array<MarkdownNode>, url: string) {
        super(text, url);
        this.nodeType = "ImageNode";
    }
}


export class HorizontalRule extends MarkdownNode {
    constructor() {
        super("HorizontalRule");
    }
}

export class ParagraphNode extends MarkdownNode {
    nodes: Array<MarkdownNode>;

    constructor(nodes: Array<MarkdownNode>) {
        super("ParagraphNode");
        this.nodes = nodes;
    }
}

export class HeadingNode extends MarkdownNode {
    level: number;
    textNodes: Array<MarkdownNode>;

    constructor(textNodes: Array<MarkdownNode>, level: number) {
        super("HeadingNode");
        this.textNodes = textNodes;
        this.level = level;
    }
}