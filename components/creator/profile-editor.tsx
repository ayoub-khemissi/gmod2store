"use client";

import { Input } from "@heroui/input";
import { useState } from "react";

import { LoadingButton } from "@/components/ui/loading-button";

interface ProfileEditorProps {
  initialBio: string;
  initialSlug: string;
  initialSocialLinks: Record<string, string>;
  onSave: (data: {
    bio: string;
    slug: string;
    social_links: Record<string, string>;
  }) => Promise<void>;
}

export const ProfileEditor = ({
  initialBio,
  initialSlug,
  initialSocialLinks,
  onSave,
}: ProfileEditorProps) => {
  const [bio, setBio] = useState(initialBio);
  const [slug, setSlug] = useState(initialSlug);
  const [discord, setDiscord] = useState(initialSocialLinks.discord ?? "");
  const [twitter, setTwitter] = useState(initialSocialLinks.twitter ?? "");
  const [github, setGithub] = useState(initialSocialLinks.github ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        bio,
        slug,
        social_links: { discord, twitter, github },
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <Input
        label="Profile URL slug"
        placeholder="my-store"
        value={slug}
        variant="bordered"
        onValueChange={setSlug}
      />
      <Input
        label="Bio"
        placeholder="Tell people about yourself..."
        value={bio}
        variant="bordered"
        onValueChange={setBio}
      />
      <Input
        label="Discord"
        placeholder="https://discord.gg/..."
        value={discord}
        variant="bordered"
        onValueChange={setDiscord}
      />
      <Input
        label="Twitter / X"
        placeholder="https://twitter.com/..."
        value={twitter}
        variant="bordered"
        onValueChange={setTwitter}
      />
      <Input
        label="GitHub"
        placeholder="https://github.com/..."
        value={github}
        variant="bordered"
        onValueChange={setGithub}
      />
      <LoadingButton
        className="w-fit"
        color="primary"
        isLoading={isSaving}
        onPress={handleSave}
      >
        Save Profile
      </LoadingButton>
    </div>
  );
};
