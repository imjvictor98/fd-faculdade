import express from "express";
import multer from "multer";
import UsuarioController from "./app/controllers/UsuarioController";
import ProfessorController from "./app/controllers/ProfessorController";
import SessionController from "./app/controllers/SessionController";
import FileController from "./app/controllers/FileController";
import GridFsController from "./app/controllers/GridFsController";
import authMiddlewareJWT from "./app/middlewares/auth";
import multerConfig from "./config/multer";

const routes = express.Router();
const upload = multer(multerConfig);
const uploadGrid = multer(GridFsController.grid());

routes.post("/aluno/registro", UsuarioController.store);
routes.get("/aluno/show", UsuarioController.show);

routes.post("/sessions", SessionController.store);

routes.post("/professor/registro", ProfessorController.store);
routes.get("/professor/show", ProfessorController.show);

routes.use(authMiddlewareJWT);

routes.put("/aluno/atualizar", UsuarioController.update);
routes.get("/aluno/index", UsuarioController.index);
routes.delete("/aluno/delete", UsuarioController.delete);
routes.post("/aluno/semestre", UsuarioController.verSemestre);
routes.post("/aluno/disciplina", UsuarioController.verDisciplina);

routes.put("/professor/atualizar", ProfessorController.update);
routes.get("/professor/index", ProfessorController.index);
routes.delete("/professor/delete", ProfessorController.delete);

routes.post("/file", upload.single("file"), FileController.store);
routes.post("/file/gridfs", uploadGrid.single("file"), (req, res) => {
  res.json({ file: req.file });
});
routes.get("/file/gridfs", GridFsController.show);

export default routes;
