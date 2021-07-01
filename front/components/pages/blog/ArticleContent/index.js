import delve from 'dlv';

import ReactMarkdown from 'react-markdown';

import { getStrapiMedia } from '../../../../utils';

import Container from '../../../shared/Container';

import 'github-markdown-css';

const gfm = require('remark-gfm');

const ArticleContent = ({ title, image, content, author }) => {
  return (
    <Container>
      <section className="text-gray-600 body-font">
        <div className="container px-5 py-24 mx-auto flex flex-col justify-center items-center">
          <h1 className="font-black sm:text-5xl text-4xl  mb-4 text-gray-900">
            {title}
          </h1>

          <div className="lg:w-4/6 mx-auto mt-10">
            <div className="shadow-lg rounded-lg overflow-hidden">
              <img
                alt={delve(image, 'alternativeText')}
                className="object-cover object-center h-full w-full"
                src={getStrapiMedia(delve(image, 'url'))}
              />
            </div>
            <div className="flex flex-col sm:flex-row mt-10 items-center justify-center">
              <div className="sm:w-1/2 text-center sm:pr-8 sm:py-8">
                <div className="w-20 h-20 shadow-md rounded-full inline-flex items-center justify-center bg-gray-200 text-gray-400">
                  <img
                    alt={delve(author, 'picture.alternativeText')}
                    className="object-cover rounded-full object-center h-full w-full"
                    src={getStrapiMedia(delve(author, 'picture.url'))}
                  />
                </div>
                <div className="flex flex-col items-center text-center justify-center">
                  <h2 className="font-medium title-font mt-4 text-gray-900 text-lg">
                    {delve(author, 'username')}
                  </h2>
                  <div className="w-12 h-1 bg-indigo-500 rounded mt-2 mb-4"></div>
                  <p className="text-sm">{delve(author, 'description')}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="markdown-body shadow-lg rounded-xl lg:w-3/6 w-full md:p-12 p-6 mt-2 bg-white">
            <ReactMarkdown
              children={content}
              remarkPlugins={[gfm]}
              components={{
                img: ({ node, ...props }) => (
                  <img src={getStrapiMedia(delve(props, 'src'))} />
                ),
              }}
            ></ReactMarkdown>
          </div>
        </div>
      </section>
    </Container>
  );
};

ArticleContent.defaultProps = {};

export default ArticleContent;
