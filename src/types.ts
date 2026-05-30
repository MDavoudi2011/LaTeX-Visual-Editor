export type BlockType = 'header' | 'section' | 'paragraph' | 'notebox' | 'warnbox' | 'examplebox';

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

export interface BoxBlock extends BaseBlock {
  type: 'notebox' | 'warnbox' | 'examplebox';
  data: {
    title: string;
    content: string;
  };
}

export type AnyBlock = HeaderBlock | SectionBlock | ParagraphBlock | BoxBlock;
