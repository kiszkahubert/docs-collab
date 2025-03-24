import { Router } from "express";
import { createNewDocument, getDocument, getUserDocuments, updateDocumentContent, deleteUserDocument } from "../controllers/DocumentController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

//Classic solution to all TypeScripts problem
router.use(verifyToken as any);
router.post("/", createNewDocument);
router.get("/", getUserDocuments);
router.get("/:id", getDocument);
router.put("/:id", updateDocumentContent);
router.delete("/:id", deleteUserDocument);

export default router;