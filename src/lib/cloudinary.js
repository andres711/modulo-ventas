const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export async function uploadCloudinaryImage(file, { folder } = {}) {
  if (!file) return null;

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Faltan variables Cloudinary en .env");
  }

  if (!String(file.type || "").startsWith("image/")) {
    throw new Error("El archivo debe ser una imagen válida");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  if (folder) formData.append("folder", folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || "Error subiendo imagen");
  }

  return {
    url: json.secure_url,
    publicId: json.public_id,
    width: json.width,
    height: json.height,
  };
}
