declare module 'turndown' {
  interface TurndownOptions {
    headingStyle?: 'setext' | 'atx';
    codeBlockStyle?: 'indented' | 'fenced';
    emDelimiter?: '_' | '*';
    bulletListMarker?: '-' | '+' | '*';
    strongDelimiter?: '__' | '**';
    linkStyle?: 'inlined' | 'referenced';
    linkReferenceStyle?: 'full' | 'collapsed' | 'shortcut';
  }

  class TurndownService {
    constructor(options?: TurndownOptions);
    turndown(html: string): string;
  }

  export default TurndownService;
} 