import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getThreads } from "~/services/thread.server";

export async function loader({ params }: LoaderFunctionArgs) {
    const threadID = params.threadID;
    console.log("Fetching thread with ID:", threadID);
    if (!threadID) {
        throw new Response("Thread ID Missing", { status: 400 });
    }
    const thread = await getThreads(threadID);
    console.log(thread);
    return thread;
}

export default function ThreadViewer() {
    const thread = useLoaderData<typeof loader>();
    return (
        <div>
            <h1>{ thread.title }</h1>
        </div>
    );
}