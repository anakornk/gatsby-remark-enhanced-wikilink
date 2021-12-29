# Gatsby Remark Enhanced Wikilink

A Gatsby Remark plugin to support Enhanced Wikilink Syntax (e.g., Obsidian Internal Links) for Gatsby ^4.0.0

- To support file linking and image embedding, use with `gatsby-remark-images`, `gatsby-remark-copy-linked-files` and `gatsby-source-filesystem`
- To be compatible with `gatsby-remark-autolink-headers`, the default implementation uses [Github Slugger](https://github.com/Flet/github-slugger) to slugify filenames and headings. This can be configured via setting a new `wikilinkToUrl` function. For more information, please see `Options` section below.

## Supported Syntax

- [x] Linking to MD files via `[[Internal Link#Heading | Alias]]`
- [x] Linking to other files via `[[../path/document.pdf]]`
- [x] Embed Images `![[../images/Hello.png]]`
- [ ] Embed Notes `![[Internal Notes]]`

## Installation

```bash
yarn add gatsby-remark-enhanced-wikilink
```

## Usage

Add the plugin to your Gatsby config:

```js
// gatsby-config.js
plugins: [
    {
        resolve: "gatsby-transformer-remark",
        options: {
            plugins: [
                {
                    resolve: 'gatsby-remark-obsidian',
                    options: {
                      stripBrackets: true,
                      imageExtensions: ['png', 'jpg', 'jpeg'],
                      fileFileExtensions: ['png', 'jpg', 'jpeg', 'pdf']
                      // see other options below
                    },
                },
            ]
        }
    },
],
```

## Options

```ts
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
```
