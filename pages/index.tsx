import Link from 'next/link'
import Layout from '../components/Layout'
import MapComponent from '../components/MapComponent';

const IndexPage = () => (
  <Layout title="Home | Next.js + TypeScript Example">
    <MapComponent />
  </Layout>
)

export default IndexPage
