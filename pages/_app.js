import '../styles/global.css';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';

export default function App({ Component, pageProps }) {
  return (
    <>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/airports">Airports</Link>
        <Link href="/favorites">Favorites</Link>
        <Link href="/about">About</Link>
      </nav>

      <Component {...pageProps} />
    </>
  );
}
