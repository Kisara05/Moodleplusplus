import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { destroyUserSession } from "~/services/auth/session.server";

export async function action({ request }: ActionFunctionArgs) {
  return destroyUserSession(request);
}

export async function loader({ request }: LoaderFunctionArgs) {
  return destroyUserSession(request);
}
