import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to="/" className="logo">
      <span className="logo-mark">TS</span>
      Tonight Sound
    </Link>
  );
}
