import visit from 'unist-util-visit';
import toString from 'mdast-util-to-string';

export = async ({ markdownAST }: any) => {
  visit(markdownAST, 'heading', (node: any) => {
    let { depth } = node;
    // Skip if not an h1
    if (depth !== 1) return;
    // Grab the innerText of the heading node
    let text = toString(node);
    const html = `
        <h1 style="color: rebeccapurple">
          ${text}
        </h1>
      `;
    node.type = 'html';
    node.children = undefined;
    node.value = html;
  });
  return markdownAST;
};
