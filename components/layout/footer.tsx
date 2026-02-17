import { Link } from "@heroui/link";
import { Divider } from "@heroui/divider";

import { siteConfig } from "@/config/site";

export const Footer = () => {
  return (
    <footer className="w-full flex flex-col items-center justify-center py-8 gap-4 glass border-t border-white/5 mt-auto">
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-default-500">
        <Link color="foreground" href="/browse" size="sm">
          Browse
        </Link>
        <Link color="foreground" href="/contact" size="sm">
          Contact
        </Link>
        <Link color="foreground" href="/tickets" size="sm">
          Support
        </Link>
        <Link
          isExternal
          color="foreground"
          href={siteConfig.links.discord}
          size="sm"
        >
          Discord
        </Link>
      </div>
      <Divider className="max-w-xs" />
      <p className="text-xs text-default-400">
        &copy; {new Date().getFullYear()} s&box Store. All rights reserved.
      </p>
    </footer>
  );
};
