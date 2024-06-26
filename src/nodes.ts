import * as utils from "./utils";

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

export class BlockQuoteNode extends MarkdownNode {
    textNodes: Array<MarkdownNode>;

    constructor(textNodes: Array<MarkdownNode>) {
        super("BlockQuoteNode");
        this.textNodes = textNodes;
    }
}

export class ListItemNode extends MarkdownNode {
    isTask = false;
    isOrdered = false;
    orderedIndex = 0;
    nestedLevel = 0;
    textNodes: Array<MarkdownNode>;
    childNodes: Array<ListItemNode>;

    constructor(textNodes: Array<MarkdownNode>, childNodes: Array<ListItemNode>, {nestedLevel = 0, isTask = false, isOrdered = false, orderedIndex = 0 } = {}) {
        super("ListItemNode");

        this.textNodes = textNodes;
        this.childNodes = childNodes;
        this.isTask = isTask;
        this.nestedLevel = nestedLevel;

        if (isOrdered) {
            this.isOrdered = isOrdered;
            this.orderedIndex = orderedIndex;
        }
    }

    push(...child: Array<ListItemNode>) {
        this.childNodes.push(...child);
    }
}

export class UnorderedListNode extends MarkdownNode {
    items: Array<ListItemNode>;
    
    constructor(items: Array<ListItemNode>) {
        super("UnorderedListNode");
        this.items = items;
    }

    push(item: ListItemNode) {
        const depth = item.nestedLevel;

        if (!(depth > 0)) {
            this.items.push(item);
            return;
        }

        let lastItem = utils.arrayLastItem(this.items) as ListItemNode;
        for(let i = 0; i < depth - 1; i++) {
            if (lastItem.childNodes.length > 0) {
                lastItem = utils.arrayLastItem(lastItem.childNodes);
            }
        }

        lastItem.push(item);
    }
}