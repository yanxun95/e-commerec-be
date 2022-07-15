import { v2 as cloudinary } from "cloudinary";

export const deleteImg = async (imageInfo: string) => {
  let imageId = imageInfo
    .split("/")
    .slice(7, 10)
    .join("/")
    .split(".")[0] as string;
  await cloudinary.uploader.destroy(imageId);
};

export const convertUrl = (title: string, id: string) => {
  const url = `/${title}/${id}`;
  const newUrl = url
    .split("")
    .filter((word) => word !== '"')
    .join("");
  return newUrl as string;
};
