import { useEffect } from 'react';

export const Comments: React.FC = () => {
  useEffect(() => {
    const script = document.createElement('script');
    const anchor = document.getElementById('inject-comments-for-uterances');
    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', String(true));
    script.setAttribute('repo', 'rafapignataro/next_blog');
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', 'github-dark');
    anchor.appendChild(script);
  }, []);
  return <div id="inject-comments-for-uterances" />;
};
