import { withAppDirSsr } from "app/WithAppDirSsr";
import type { PageProps as _PageProps } from "app/_types";
import { cookies, headers } from "next/headers";

import { buildLegacyCtx } from "@lib/buildLegacyCtx";
import { getServerSideProps } from "@lib/org/[orgSlug]/directory/getServerSideProps";

import type { DirectoryPageProps } from "~/team/directory-view";
import DirectoryPage from "~/team/directory-view";

export const generateMetadata = async ({ params }: _PageProps) => {
  const decodedParams = await params;

  return {
    title: `CTO Directory | RainCal`,
    description: "Browse and book advisory sessions with experienced CTOs",
    openGraph: {
      title: `CTO Directory | RainCal`,
      description: "Browse and book advisory sessions with experienced CTOs",
    },
  };
};

const getData = withAppDirSsr<DirectoryPageProps>(getServerSideProps);

const ServerPage = async ({ params, searchParams }: _PageProps) => {
  const props = await getData(
    buildLegacyCtx(await headers(), await cookies(), await params, await searchParams)
  );
  return <DirectoryPage {...props} />;
};

export default ServerPage;
