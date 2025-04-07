import { Router } from "express";
import {
    createNewDocument,
    getDocument,
    getUserDocuments,
    updateDocumentContent,
    deleteUserDocument,
    shareDocument,
    getDocumentSharedUsers,
    revokeAccess
} from "../controllers/DocumentController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

router.use(verifyToken as any);
router.post("/", createNewDocument);
router.get("/", getUserDocuments);
router.get("/:id", getDocument);
router.put("/:id", updateDocumentContent);
router.delete("/:id", deleteUserDocument);
router.post("/:id/share", shareDocument);
router.get("/:id/shared", getDocumentSharedUsers);
router.delete("/:id/share/:userId", revokeAccess);

export default router;