export async function login() {
  if (typeof window === "undefined") return null;

  // mode Fallback (Browser biasa)
  if (!("Pi" in window)) {
    return {
      uid: "dev-001",
      username: "Developer User",
      mode: "fallback"
    };
  }

  // mode Pi Browser (nanti)
  const user = await window.Pi.authenticate([]);
  return {
    uid: user.uid,
    username: user.username,
    mode: "pi-browser"
  };
}
