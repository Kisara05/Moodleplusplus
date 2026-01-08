import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { supabase } from "~/services/supabase.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // 1. Get all Section IDs from the Database
  const { data: sections, error: dbError } = await supabase
    .from("section")
    .select("section_id");

  if (dbError || !sections) {
    throw new Response("Database Error: " + dbError?.message, { status: 500 });
  }

  // 2. Get list of existing folders/files in the bucket root
  const { data: existingItems, error: listError } = await supabase.storage
    .from("posts")
    .list(); // Empty parameters means "list root directory"

  if (listError || !existingItems) {
    throw new Response("Storage List Error: " + listError?.message, { status: 500 });
  }

  // Extract just the names (e.g., ["1", "2", "101"])
  const existingFolderNames = existingItems.map((item) => item.name);

  // 3. Identify which sections are missing a folder
  // We convert section_id to String because storage names are always strings
  const missingSections = sections.filter(
    (section) => !existingFolderNames.includes(String(section.section_id))
  );

  const results = [];

  // 4. Create folders ONLY for the missing ones
  if (missingSections.length === 0) {
    return json({ message: "All folders already exist. Nothing to do." });
  }

  for (const section of missingSections) {
    const folderName = section.section_id;
    const placeholderPath = `${folderName}/.keep`; 

    // Create the empty .keep file
    const emptyFile = new Blob([""], { type: "text/plain" });

    const { error: storageError } = await supabase.storage
      .from("posts")
      .upload(placeholderPath, emptyFile, {
        upsert: false,
      });

    if (!storageError) {
      results.push(`Created folder: ${folderName}`);
    } else {
      console.error(`Failed to create ${folderName}:`, storageError);
      results.push(`Error on ${folderName}: ${storageError.message}`);
    }
  }

  // 5. Final Report
  return json({
    message: "Sync Complete",
    total_sections_in_db: sections.length,
    folders_already_existed: sections.length - missingSections.length,
    new_folders_created: results,
  });
}