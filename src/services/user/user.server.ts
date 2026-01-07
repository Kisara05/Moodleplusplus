// File này sẽ chứa logic backend (CRUD) cho User (Profile, etc.)
export async function getUserProfile(userId: string) {
  console.log("User Service: Getting profile", userId);
  return { id: userId, name: "A student" };
}
