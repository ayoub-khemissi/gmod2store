import { title } from "@/components/primitives";
import { SteamLoginButton } from "@/components/auth/steam-login-button";

export default function LoginPage() {
  return (
    <section className="flex flex-col items-center justify-center gap-6 py-8 md:py-10">
      <h1 className={title({ size: "sm" })}>Sign In</h1>
      <p className="text-default-500 text-center max-w-md">
        Sign in with your Steam account to access the marketplace, manage your
        library, and start selling.
      </p>
      <SteamLoginButton />
    </section>
  );
}
