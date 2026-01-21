const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export async function uploadToCloudinary(file) {
  if (!CLOUD || !PRESET) throw new Error("Faltan variables Cloudinary en .env");

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", PRESET);
  form.append("folder", "ilsupremo/productos");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
    method: "POST",
    body: form,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || "Error subiendo imagen");

  return {
    url: json.secure_url,
    publicId: json.public_id,
    width: json.width,
    height: json.height,
  };
}
