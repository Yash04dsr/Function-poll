import Head from 'next/head';
import VotingPage from '../components/VotingPage';

export default function Vote() {
  return (
    <>
      <Head>
        <title>Vote - Festival Voting App</title>
        <meta name="description" content="Cast your vote for cultural festival performances" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <VotingPage />
    </>
  );
}
