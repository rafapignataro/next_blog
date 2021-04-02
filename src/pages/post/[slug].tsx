import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
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
}

const Post: React.FC<PostProps> = ({ post }) => {
  return (
    <>
      <Head>
        <title>blabla - Spacetraveling</title>
      </Head>
      <Header />
      <main className={styles.container}>
        <div className={styles.imgContainer}>
          <img src={post.data.banner.url} alt="banner" />
        </div>
        <div className={styles.postContainer}>
          <strong>{post.data.title}</strong>
          <div className={commonStyles.postInfo}>
            <div>
              <FiCalendar />
              <p>{post.first_publication_date}</p>
            </div>
            <div>
              <FiUser />
              <p>{post.data.author}</p>
            </div>
            <div>
              <FiClock />
              <p>{post.data.author}</p>
            </div>
          </div>
          <div className={styles.postContent}>
            {post.data.content.map((content, contentIndex) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={`content__${contentIndex}`}>
                <h3>{content.heading}</h3>
                <div dangerouslySetInnerHTML={{ __html: content.body.text }} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Post;

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);

  return {
    fallback: 'blocking',
    paths: [],
  };
  // TODO
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();
  const { slug } = params;

  const response = await prismic.getByUID('posts', String(slug), {});

  const content = response.data.content.map(con => ({
    heading: con.heading,
    body: {
      text: RichText.asHtml(con.body),
    },
  }));

  const post = {
    ...response,
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      ...response.data,
      content,
    },
  };

  return {
    props: {
      post,
    },
  };
};
