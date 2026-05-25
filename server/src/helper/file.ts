export const toPublicUrl = (filePath: string) => {
  if (!filePath) return "";
  const backendUrl = process.env.BACKEND_URL || "http://localhost:5001";
  return `${backendUrl}/${filePath.replace(/\\/g, "/")}`; // normalize slashes
};
