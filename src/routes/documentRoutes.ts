import { Router } from "express";
import { createNewDocument, getDocument, getUserDocuments, updateDocumentContent, deleteUserDocument } from "../controllers/DocumentController";
import { verifyToken } from "../main";

const router = Router();

router.use(verifyToken);
router.post("/", createNewDocument);
router.get("/", getUserDocuments);
router.get("/:id", getDocument);
router.put("/:id", updateDocumentContent);
router.delete("/:id", deleteUserDocument);

export default router;