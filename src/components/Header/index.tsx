import Link from 'next/link';

import styles from './header.module.scss';

const Header: React.FC = () => {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Link href="/">
          <img src="/logo.svg" alt="logo" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
