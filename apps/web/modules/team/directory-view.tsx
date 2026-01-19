"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { markdownToSafeHTML } from "@calcom/lib/markdownToSafeHTML";
import type { UserProfile } from "@calcom/types/UserProfile";
import { UserAvatar } from "@calcom/ui/components/avatar";

type MemberType = {
  id: number;
  name: string | null;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  organizationId: number | null;
  safeBio: string | null;
  bookerUrl: string;
  profile: Omit<UserProfile, "upId">;
};

export type DirectoryPageProps = {
  org: {
    name: string | null;
    slug: string | null;
    logoUrl: string | null;
  };
  members: MemberType[];
  isValidOrgDomain: boolean;
  currentOrgDomain: string | null;
};

const CTOCard = ({ member }: { member: MemberType }) => {
  const { t } = useLocale();
  const isBioEmpty = !member.bio || !member.bio.replace("<p><br></p>", "").length;

  return (
    <Link href={`${member.bookerUrl}/${member.username}`}>
      <div className="bg-default hover:bg-cal-muted border-subtle group flex min-h-full flex-col rounded-lg border p-6 transition hover:cursor-pointer hover:shadow-md">
        <div className="flex flex-col items-center text-center">
          <UserAvatar noOrganizationIndicator size="lg" user={member} className="h-20 w-20" />
          <h3 className="text-default mt-4 text-lg font-semibold">{member.name}</h3>
          {!isBioEmpty && (
            <div
              className="text-subtle mt-2 line-clamp-3 text-sm [&_a]:text-blue-500 [&_a]:underline"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is sanitized
              dangerouslySetInnerHTML={{ __html: markdownToSafeHTML(member.bio) }}
            />
          )}
          <span className="text-brand mt-4 text-sm font-medium group-hover:underline">
            {t("book_a_meeting")} &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
};

const SearchInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const { t } = useLocale();

  return (
    <div className="mx-auto mb-8 w-full max-w-md">
      <input
        type="text"
        placeholder={t("search") + "..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-subtle bg-default text-default placeholder:text-muted w-full rounded-lg border px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      />
    </div>
  );
};

function DirectoryPage({ org, members, isValidOrgDomain }: DirectoryPageProps) {
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) {
      return members;
    }

    const query = searchQuery.toLowerCase();
    return members.filter((member) => {
      const nameMatch = member.name?.toLowerCase().includes(query);
      const bioMatch = member.bio?.toLowerCase().includes(query);
      return nameMatch || bioMatch;
    });
  }, [members, searchQuery]);

  return (
    <main className="dark:bg-default bg-subtle min-h-screen px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-emphasis text-3xl font-bold tracking-tight sm:text-4xl">
            {t("meet_our_team") || "Meet Our CTOs"}
          </h1>
          <p className="text-subtle mt-4 text-lg">
            {t("book_advisory_session") || "Book advisory sessions with experienced tech leaders"}
          </p>
        </div>

        {/* Search */}
        <SearchInput value={searchQuery} onChange={setSearchQuery} />

        {/* CTO Grid */}
        {filteredMembers.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMembers.map((member) => (
              <CTOCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted text-lg">
              {searchQuery
                ? t("no_results_found") || "No CTOs found matching your search"
                : t("no_team_members") || "No team members available"}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default DirectoryPage;
