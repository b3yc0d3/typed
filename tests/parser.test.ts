import * as Nodes from '../src/nodes';
import { BlockParser, FragmentParser, TypedParser } from '../src/parser';

describe("FragmentParser", () => {
    test.each([
        ["Empty", "", []],
        ["Bold", "**text**", [new Nodes.BoldNode("text")]],
        ["Italic", "*text*", [new Nodes.ItalicNode("text")]],
        ["Code", "`text`", [new Nodes.CodeNode("text")]],
        ["Link", "[Title](https://example.com/)", [new Nodes.LinkNode([new Nodes.TextNode("Title")], "https://example.com/")]],
        ["Image", "![Alt](https://example.com/image.png)", [new Nodes.ImageNode([new Nodes.TextNode("Alt")], "https://example.com/image.png")]],
    ])("%p", (t: string, input: string, result: Nodes.MarkdownNode[]) => {
        let parser = new FragmentParser(input);
        let nodes = parser.parse();

        expect(nodes).toStrictEqual(result);
    });
});

describe("FragmentParser invalid inputs", () => {
    test.each([
        ["Bold", "**text", [new Nodes.TextNode("**text")]],
        ["Italic", "*text", [new Nodes.TextNode("*text")]],
        ["Code", "`text", [new Nodes.TextNode("`text")]],
        ["Link", "[Title](https://example.com/", [new Nodes.TextNode("[Title](https://example.com/")]],
        ["Image", "![Alt](https://example.com/image.png", [new Nodes.TextNode("![Alt](https://example.com/image.png")]],
    ])("%p", (t: string, input: string, result: Nodes.MarkdownNode[]) => {
        let parser = new FragmentParser(input);
        let nodes = parser.parse();

        expect(nodes).toStrictEqual(result);
    });
});

describe("BlockParser", () => {
    test('Empty Document', () => {
        let text = "";
        let parser = new BlockParser(text);
        let nodes = parser.parse();

        expect(nodes).toStrictEqual([]);
    });

    test('Single Line Of Text', () => {
        let text = "Hello World";
        let parser = new BlockParser(text);
        let nodes = parser.parse();

        expect(nodes).toStrictEqual([
            new Nodes.TextNode(text),
        ]);
    });

    test('Heading', () => {
        let text = "# Heading 1";
        let parser = new BlockParser(text);
        let nodes = parser.parse();

        expect(nodes).toStrictEqual([
            new Nodes.HeadingNode([
                new Nodes.TextNode("Heading 1"),
            ], 1),
        ]);
    });

    test('Blockquote', () => {
        let text = "> Blockquote 1\n> Blockquote 2\n>Blockquote 3";
        let parser = new BlockParser(text);
        let nodes = parser.parse();

        expect(nodes).toStrictEqual([
            new Nodes.BlockQuote([
                new Nodes.TextNode("Blockquote 1"),
                new Nodes.TextNode("Blockquote 2"),
                new Nodes.TextNode("Blockquote 3"),
            ]),
        ]);
    });
});

describe("TypedParser", () => {
    test('Parsing Empty Document', () => {
        let text = "";
        let parser = new TypedParser();
        let nodes = parser.parse(text);

        expect(nodes).toStrictEqual([]);
    });

    test('Parsing Single Line Of Text', () => {
        let text = "Hello World";
        let parser = new TypedParser();
        let nodes = parser.parse(text);

        expect(nodes).toStrictEqual([
            new Nodes.ParagraphNode([
                new Nodes.TextNode(text)
            ])
        ]);
    });

    test('Parsing Multiple Text Blocks With Nested Bold', () => {
        let text = `
This is a text block **with some bold text**.

Another paragraph with more **BOLD** text.
`;
        let parser = new TypedParser();
        let nodes = parser.parse(text);

        expect(nodes).toStrictEqual([
            new Nodes.ParagraphNode([
                new Nodes.TextNode("This is a text block "),
                new Nodes.BoldNode("with some bold text"),
                new Nodes.TextNode("."),
            ]),
            new Nodes.ParagraphNode([
                new Nodes.TextNode("Another paragraph with more "),
                new Nodes.BoldNode("BOLD"),
                new Nodes.TextNode(" text."),
            ]),
        ]);
    });

    test('Parsing Horizontal Rule', () => {
        let text = "---";
        let parser = new TypedParser();
        let nodes = parser.parse(text);

        expect(nodes).toStrictEqual([
            new Nodes.HorizontalRule(),
        ]);
    });

    test('Full Test', () => {
        let text = `# Heading 1

        **Bold text**
        *Italic text*

        [**Important** Infos *here*](https://example.com/)
        > A little blockquote`;
        let parser = new TypedParser();
        let nodes = parser.parse(text);

        expect(nodes).toStrictEqual([
            new Nodes.HeadingNode([
                new Nodes.TextNode("Heading 1"),
            ], 1),
            new Nodes.ParagraphNode([
                new Nodes.BoldNode("Bold text"),
                new Nodes.ItalicNode("Italic text"),
            ]),
            new Nodes.ParagraphNode([
                new Nodes.LinkNode([
                    new Nodes.BoldNode("Important"),
                    new Nodes.TextNode(" Infos "),
                    new Nodes.ItalicNode("here"),
                ], "https://example.com/"),
            ]),
            new Nodes.BlockQuote([
                new Nodes.TextNode("A little blockquote"),
            ]),
        ]);
    });
});