import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../Model/categoryModel.js";
import { adminAuth } from "../middleware/authMiddleware/authMiddleware.js";

import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../utility/responseHelper.js";
import upload from "../middleware/imageUploader/cloudinaryImageUploader.js";
import cloudinary from "../config/cloudinaryConfig.js";

const categoryRouter = express.Router();

// PUBLIC ROUTES

// GET ALL CATEGORIES
categoryRouter.get("/", async (req, res) => {
  try {
    const categories = await getCategories();

    categories?.length
      ? buildSuccessResponse(res, categories, "Categories")
      : buildErrorResponse(res, "Could not fetch data");
  } catch (error) {
    buildErrorResponse(res, "Could not fetch data");
  }
});

// private route | create category
// categoryRouter.post("/", adminAuth, categoryImageUpload.single("image"), async(req, res) => {
//   try {
//     if(req.file) {
//       req.body.thumbnail = req.file.path.slice(6)
//     }

//     const category = await createCategory(req.body)

//     return category?._id
//         ? buildSuccessResponse(res, category, "Category creaetd successfully")
//         : buildErrorResponse(res, "Could not create category.")
//   } catch (error) {
//     buildErrorResponse(res, "Could not create category.")
//   }
// })

categoryRouter.post(
  "/",
  adminAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      const uploadResult = await new Promise((resolve) => {
        cloudinary.uploader
          .upload_stream({ folder: "Category" }, (error, uploadResult) => {
            if (error) {
              return reject(error);
            }

            return resolve(uploadResult);
          })
          .end(req.file.buffer);
      });

      if (req.file) {
        req.body.thumbnail = uploadResult?.secure_url;

        const category = await createCategory(req.body);

        return category?._id
          ? buildSuccessResponse(res, category, "Category creaetd successfully")
          : buildErrorResponse(res, "Could not create category.");
      }

      buildErrorResponse(res, "Could not create category.");
    } catch (error) {
      buildErrorResponse(res, "Could not create category.");
    }
  }
);

categoryRouter.patch(
  "/",
  adminAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      if (req.file) {
        const uploadResult = await new Promise((resolve) => {
          cloudinary.uploader
            .upload_stream({ folder: "Category" }, (error, uploadResult) => {
              if (error) {
                return reject(error);
              }

              return resolve(uploadResult);
            })
            .end(req.file.buffer);
        });

        req.body.thumbnail = uploadResult?.secure_url;

        const category = await updateCategory(req.body);

        return category?._id
          ? buildSuccessResponse(res, category, "Category updated successfully")
          : buildErrorResponse(res, "Could not update category.");
      }

      // when image is not sent or updated
      const { title, _id } = req.body;
      const updatedCategory = { _id, title };

      const category = await updateCategory(updatedCategory);

      category?._id
        ? buildSuccessResponse(res, category, "Category updated successfully")
        : buildErrorResponse(res, "Could not update category.");
    } catch (error) {
      buildErrorResponse(res, "Could not update category.");
    }
  }
);

categoryRouter.delete("/", adminAuth, async (req, res) => {
  try {
    const { _id } = req.body;
    const result = await deleteCategory(_id);
    if (result?._id) {
      buildSuccessResponse(res, {}, "Category successfully deleted");
    }
    buildErrorResponse(res, "Could not delete category");
  } catch (error) {
    buildErrorResponse(res, "Could not delete category");
  }
});
export default categoryRouter;
