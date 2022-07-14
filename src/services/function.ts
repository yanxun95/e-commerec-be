import { v2 as cloudinary } from "cloudinary";

export const deleteImg = async (imageInfo: string) => {
  let imageId = imageInfo
    .split("/")
    .slice(7, 10)
    .join("/")
    .split(".")[0] as string;
  await cloudinary.uploader.destroy(imageId, function (error, result) {
    console.log(result, error);
  });
};
