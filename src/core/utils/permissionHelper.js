export const hasPermission = (auth, key) => {
  if (!auth) return false;

  const role = String(auth.role).toLowerCase();
  const perms = auth.permissions?.map((p) => p.toLowerCase()) || [];

  if (role === "admin" || perms.includes("all")) return true;
  
  return perms.includes(key.toLowerCase());
};
