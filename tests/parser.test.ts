import * as Nodes from '../src/nodes';
import { BlockParser, FragmentParser, TypedParser } from '../src/parser';

describe("FragmentParser", () => {
    test.each([
        ["Empty", "", []],
        ["Bold", "**text**", [new Nodes.BoldNode("text")]],
        ["Italic", "*text*", [new Nodes.ItalicNode("text")]],
        ["Code", "`text`", [new Nodes.CodeNode("text")]],
        ["Link", "[Title](https://example.com/)", [new Nodes.LinkNode([new Nodes.TextNode("Title")], "https://example.com/")]],
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
        ["Link", "[Title(https://example.com/)", [new Nodes.TextNode("[Title(https://example.com/)")]],
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
            new Nodes.HeadingNode("Heading 1", 1),
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
});