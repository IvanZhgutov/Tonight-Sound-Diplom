import { Link } from 'react-router-dom';

// interactive=false — логотип без ссылки (режим админа)
export default function Logo({ interactive = true }) {
  const content = (
    <>
      <span className="logo-mark">TS</span>
      Tonight Sound
    </>
  );

  if (!interactive) {
    return <span className="logo logo-static">{content}</span>;
  }

  return (
    <Link to="/" className="logo">
      {content}
    </Link>
  );
}
