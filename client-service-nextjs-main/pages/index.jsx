import Head from "next/head";
import DashboardComponent from "~/components/dashboard/DashboardComponent";
import Layout from "~/layout/Layout";

export default function Home() {
  return (
    <>
      <Head>
        <title> Uplist | Dashboard </title>
      </Head>
      <Layout>
        <DashboardComponent />
      </Layout>
    </>
  );
}
