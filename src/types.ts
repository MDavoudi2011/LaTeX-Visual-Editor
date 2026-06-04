export type BlockType = 'header' | 'section' | 'paragraph' | 'notebox' | 'warnbox' | 'examplebox' | 'list' | 'code';

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface HeaderBlock extends BaseBlock {
  type: 'header';
  data: {
    title: string;
    subtitle: string;
    instructor: string;
    mentor: string;
  };
}

export interface SectionBlock extends BaseBlock {
  type: 'section';
  data: {
    title: string;
  };
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph';
  data: {
    content: string;
  };
}

export interface ListBlock extends BaseBlock {
  type: 'list';
  data: {
    items: string[];
  };
}

export interface CodeBlock extends BaseBlock {
  type: 'code';
  data: {
    language: string;
    code: string;
  };
}

export type InnerBlock = ParagraphBlock | ListBlock | CodeBlock;

export interface BoxBlock extends BaseBlock {
  type: 'notebox' | 'warnbox' | 'examplebox';
  data: {
    title: string;
    content?: string;
    items?: InnerBlock[];
  };
}

export type AnyBlock = HeaderBlock | SectionBlock | ParagraphBlock | BoxBlock | ListBlock | CodeBlock;

export interface Project {
  id: string;
  user_id: string;
  name: string;
  data: AnyBlock[];
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}
