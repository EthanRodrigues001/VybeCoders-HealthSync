import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// FileRouter for medical documents
export const ourFileRouter = {
  // Medical documents uploader for prescriptions and records
  medicalDocuments: f({
    image: {
      maxFileSize: "10MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      // Basic auth check - in production you'd validate the user session
      const userId = req.headers.get("x-user-id") || "anonymous";

      if (!userId) {
        throw new UploadThingError("Unauthorized");
      }

      // Return metadata that will be available in onUploadComplete
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code runs on your server after upload
      console.log(
        "Medical document upload complete for userId:",
        metadata.userId
      );
      console.log("File URL:", file.url);
      console.log("File name:", file.name);
      console.log("File size:", file.size);

      // Return data to the client
      return {
        uploadedBy: metadata.userId,
        fileUrl: file.url,
        fileName: file.name,
        fileSize: file.size,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
