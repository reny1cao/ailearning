import React from 'react';
import { marked } from 'marked';

interface RichTextContentProps {
  content: string;
}

const RichTextContent: React.FC<RichTextContentProps> = ({ content }) => {
  const htmlContent = marked(content);

  return (
    <div 
      className="prose prose-lg max-w-none
        prose-headings:text-gray-900 prose-headings:font-bold prose-headings:scroll-mt-20
        prose-h1:text-4xl prose-h1:mb-8 prose-h1:leading-tight
        prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-12 prose-h2:leading-tight
        prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8
        prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-6
        prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
        prose-strong:text-gray-900 prose-strong:font-semibold
        prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-2 prose-code:py-0.5 prose-code:rounded
        prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-pre:p-6 prose-pre:rounded-lg
        prose-ul:my-6 prose-ul:list-disc prose-ul:pl-8
        prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-8
        prose-li:mb-3 prose-li:text-gray-600
        prose-blockquote:border-l-4 prose-blockquote:border-indigo-200 prose-blockquote:bg-indigo-50 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:my-8
        prose-img:rounded-lg prose-img:shadow-md
        prose-hr:my-12 prose-hr:border-gray-200"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default RichTextContent;