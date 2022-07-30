import Head from 'next/head'
import dynamic from 'next/dynamic';

const ChessGui = dynamic(() => import('../components/DisplayChess'), {
  ssr: false
});

export default function Home() {
  return (
    <div>
      <Head>
        <title>Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel='manifest' href='/manifest.json' />
      </Head>
      <ChessGui />
    </div>
  )
}