import { uploadCloudinaryImage } from "../../lib/cloudinary";

export async function uploadExpenseReceipt(file) {
  return uploadCloudinaryImage(file, { folder: "ilsupremo/gastos" });
}
