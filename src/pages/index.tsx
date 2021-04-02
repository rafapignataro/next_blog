import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

const Home: React.FC<HomeProps> = ({ postsPagination }) => {
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [posts, setPosts] = useState(postsPagination.results);

  useEffect(() => {
    if (!nextPage) return;

    fetch(nextPage).then(response => response.json());
  }, [nextPage]);

  const handleLoadMore = async (): Promise<void> => {
    if (!nextPage) return;

    const response = await fetch(nextPage);
    const { results, next_page } = await response.json();
    setNextPage(next_page);
    setPosts([
      ...posts,
      {
        ...results[0],
        first_publication_date: format(
          new Date(results[0].first_publication_date),
          'dd MMM yyyy',
          {
            locale: ptBR,
          }
        ),
      },
    ]);
  };

  return (
    <>
      <Head>
        <title>Home - Spacetraveling</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.header}>
          <img src="/logo.svg" alt="logo" />
        </div>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong className={styles.postTitle}>{post.data.title}</strong>
                <p className={styles.postSubtitle}>{post.data.subtitle}</p>
                <div className={styles.postInfo}>
                  <div>
                    <FiCalendar />
                    <p>{post.first_publication_date}</p>
                  </div>
                  <div>
                    <FiUser />
                    <p>{post.data.author}</p>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
        {nextPage && (
          <button
            type="button"
            className={styles.loadMoreButton}
            onClick={() => handleLoadMore()}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    { fetch: ['post.title', 'post.content'], pageSize: 1 }
  );

  const results = postsResponse.results.map(post => ({
    ...post,
    first_publication_date: format(
      new Date(post.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
  }));

  return {
    props: {
      postsPagination: {
        results,
        next_page: postsResponse.next_page,
      },
    },
  };
};
