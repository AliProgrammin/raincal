import type { GetServerSidePropsContext } from "next";

import { getBookerBaseUrlSync } from "@calcom/features/ee/organizations/lib/getBookerBaseUrlSync";
import { orgDomainConfig } from "@calcom/features/ee/organizations/lib/orgDomains";
import { getTeamWithMembers } from "@calcom/features/ee/teams/lib/queries";
import { markdownToSafeHTML } from "@calcom/lib/markdownToSafeHTML";
import slugify from "@calcom/lib/slugify";

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const orgSlug = context.params?.orgSlug as string;

  const { isValidOrgDomain, currentOrgDomain } = orgDomainConfig(
    context.req,
    context.params?.orgSlug ?? context.query?.orgSlug
  );

  // Fetch the organization with its members
  const org = await getTeamWithMembers({
    slug: slugify(orgSlug ?? ""),
    orgSlug: currentOrgDomain,
    isTeamView: false,
    isOrgView: true,
  });

  if (!org || !org.isOrganization) {
    return { notFound: true } as const;
  }

  // Filter to only accepted members and format for display
  const members = org.members
    .filter((member) => member.accepted && member.username)
    .map((member) => ({
      id: member.id,
      name: member.name,
      username: member.username,
      bio: member.bio,
      avatarUrl: member.avatarUrl,
      organizationId: member.organizationId,
      safeBio: markdownToSafeHTML(member.bio || ""),
      bookerUrl: getBookerBaseUrlSync(org.slug || ""),
      profile: member.profile,
    }));

  return {
    props: {
      org: {
        name: org.name,
        slug: org.slug,
        logoUrl: org.logoUrl,
      },
      members,
      isValidOrgDomain,
      currentOrgDomain,
    },
  } as const;
};
