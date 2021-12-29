import visit from 'unist-util-visit';
import { Node } from 'unist';
import GithubSlugger from 'github-slugger';
import type { Text } from 'mdast';

type WikilinkArgs = {
  fileName?: string;
  heading?: string;
  alias?: string;
};

type Options = {
  stripBrackets?: boolean;
  wikilinkToUrl?: (args: WikilinkArgs) => string;
  wikilinkToLinkText?: (args: WikilinkArgs) => string;
  imageExtensions?: Array<string>;
  linkFileExtensions?: Array<string>;
};

const slugify = GithubSlugger.slug;

const defaultWikilinkToUrl: Options['wikilinkToUrl'] = ({
  fileName,
  heading,
}) => {
  return `${slugify(fileName)}${heading && `#${slugify(heading)}`}` || '#';
};

const defaultWikilinkToLinkText: Options['wikilinkToLinkText'] = ({
  fileName,
  heading,
  alias,
}) => {
  return (
    alias ||
    (fileName && heading && `${fileName} > ${heading}`) ||
    fileName ||
    `> ${heading}`
  );
};

const wrapWithBrackets = (text: string, isEmbed: boolean = false) => {
  return isEmbed ? `![[${text}]]` : `[[${text}]]`;
};

const transformWikilink = (
  { markdownAST }: { markdownAST: Node },
  {
    stripBrackets = true,
    wikilinkToUrl = defaultWikilinkToUrl,
    wikilinkToLinkText = defaultWikilinkToLinkText,
    imageExtensions = ['png', 'jpg', 'jpeg'],
    linkFileExtensions = ['png', 'jpg', 'jpeg', 'pdf'],
  }: Options
) => {
  visit<Text>(markdownAST, 'text', (node, index, parent) => {
    if (!parent) return;

    const { value: text } = node;

    const wikilinkRegExp = /(!?)\[\[(.+?)\]\]/g;

    const result = [];
    let start = 0;

    let match = wikilinkRegExp.exec(text);

    // loop each match and transform wikilinks
    while (match) {
      const position = match.index;
      const fullMatchedString = match[0];
      const isEmbed = match[1] === '!';
      const wikilinkText = match[2];

      if (start !== position) {
        result.push({
          type: 'text',
          value: text.slice(start, position),
        });
      }

      if (isEmbed) {
        const imageRegExp = new RegExp(
          `([^\\/]*)\\.(?:${imageExtensions.join('|')})$`,
          'i'
        );
        const imageMatch = wikilinkText.match(imageRegExp);
        if (imageMatch) {
          result.push({
            type: 'image',
            url: wikilinkText,
            alt: imageMatch[1] || wikilinkText,
          });
        } else {
          // TODO:  Support embed MD
          result.push({
            type: 'text',
            value: wrapWithBrackets(wikilinkText, true),
          });
        }
      } else {
        const linkFileRegExp = new RegExp(
          `\\.(?:${linkFileExtensions.join('|')})$`,
          'i'
        );
        if (wikilinkText.match(linkFileRegExp)) {
          result.push({
            type: 'link',
            url: wikilinkText,
            children: [
              {
                type: 'text',
                value: stripBrackets
                  ? wikilinkText
                  : wrapWithBrackets(wikilinkText),
              },
            ],
          });
        } else {
          // get file name, heading and alias
          const splitRegex = /([^#\|]*)(?:#?)([^\|]*)(?:\|?)(.*)/; // split wikilink text to fileName, heading and alias
          let [_, fileName, heading, alias] = wikilinkText.match(
            splitRegex
          ) || [,];
          fileName = fileName?.replace(/\.md$/, '').trim(); // support filename with md ext
          heading = heading?.trim();
          alias = alias?.trim();

          const url = wikilinkToUrl({ fileName, heading, alias });
          const linkText = wikilinkToLinkText({ fileName, heading, alias });

          result.push({
            type: 'link',
            url: url,
            children: [
              {
                type: 'text',
                value: stripBrackets ? linkText : wrapWithBrackets(linkText),
              },
            ],
          });
        }
      }

      start = position + fullMatchedString.length;
      match = wikilinkRegExp.exec(text);
    }

    // if there is at least one match
    if (result.length > 0) {
      // add the rest of the text that hasn't been matched
      if (start < text.length) {
        result.push({ type: 'text', value: text.slice(start) });
      }
      // add siblings
      parent.children.splice(index, 1, ...result);
      return index + result.length;
    }
  });
};

export = transformWikilink;
