import { uploadCloudinaryImage } from "../../lib/cloudinary";

export async function uploadProductImage(file) {
  return uploadCloudinaryImage(file, { folder: "ilsupremo/productos" });
}
