/* eslint-disable no-param-reassign */
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
}

const Post: React.FC<PostProps> = ({ post, preview }) => {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  const totalWords = post.data.content.reduce((total, contentItem) => {
    total += contentItem.heading.split(' ').length;
    contentItem.body.forEach(item => {
      total += item.text.split(' ').length;
    });
    return total;
  }, 0);

  const timeToRead = Math.ceil(totalWords / 200);

  const firstDateFormated = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
  );

  const lastDateFormated = post.last_publication_date
    ? format(new Date(post.last_publication_date), "dd MMM yyyy, à's' k:m", {
        locale: ptBR,
      })
    : null;

  return (
    <>
      <Head>
        <title>{post.data.title} - Spacetraveling</title>
      </Head>
      <Header />
      <main className={styles.container}>
        {post.data.banner.url && (
          <div className={styles.imgContainer}>
            <img src={post.data.banner.url} alt="banner" />
          </div>
        )}
        <div className={styles.postContainer}>
          <strong>{post.data.title}</strong>
          <div className={commonStyles.postInfo}>
            <div>
              <FiCalendar />
              <p>{firstDateFormated}</p>
            </div>
            <div>
              <FiUser />
              <p>{post.data.author}</p>
            </div>
            <div>
              <FiClock />
              <p>{timeToRead} min</p>
            </div>
          </div>
          {lastDateFormated && (
            <div className={styles.lastEditDate}>
              * editado em {lastDateFormated}
            </div>
          )}
          <div className={styles.postContent}>
            {post.data.content.map((content, contentIndex) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={`content__${contentIndex}`}>
                <h3>{content.heading}</h3>
                <div
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
      {preview && (
        <aside className={commonStyles.previewContainer}>
          <Link href="/api/exit-preview">
            <a>Sair do modo Preview</a>
          </Link>
        </aside>
      )}
    </>
  );
};

export default Post;

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts')
  );

  const paths = posts.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    fallback: true,
    paths,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData = {},
}) => {
  const prismic = getPrismicClient();
  const { slug } = params;

  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref || null,
  });

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url || null,
      },
      content: response.data.content.map(content => ({
        heading: content.heading,
        body: [...content.body],
      })),
    },
  };

  return {
    props: {
      post,
      preview,
    },
    revalidate: 60,
  };
};
