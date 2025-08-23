import Auth from "../../../../components/Auth";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const title = "Login/Register";
  const description = "Login to your account";

  return {
    title,
    description,
  }
}

export default function AuthPage() {
  return <Auth />;
}
