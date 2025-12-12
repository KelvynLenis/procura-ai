import { cookies } from "next/headers";

export function GET() {
  const getCookie = async () => {
    const cookieStore = await cookies();
    const cookie = cookieStore.get("a_session_689f30820026b5401f7d_legacy"); // nome do cookie

    console.log(cookie);

    return cookie;
  };

  const cookie = getCookie();

  return Response.json({ cookie });
}
