import express from "express";
import multer from "multer";
import UsuarioController from "./app/controllers/UsuarioController";
import ProfessorController from "./app/controllers/ProfessorController";
import SessionController from "./app/controllers/SessionController";
import FileController from "./app/controllers/FileController";
import authMiddlewareJWT from "./app/middlewares/auth";
import multerConfig from "./config/multer";

const routes = express.Router();
const upload = multer(multerConfig);

routes.post("/aluno/login", UsuarioController.signIn);
routes.post("/professor/login", ProfessorController.signIn);
routes.post("/aluno/register", UsuarioController.signUp);
routes.post("/professor/register", ProfessorController.signUp);
routes.post("/aluno/recsenha", UsuarioController.recoverPwd);
routes.post("/professor/recsenha", ProfessorController.recoverPwd);

routes.post("/sessions", SessionController.store);

routes.use(authMiddlewareJWT);

routes.post("/file", upload.single("file"), FileController.store);

routes.post("/professor/notas", ProfessorController.lancarNotas);
routes.post("/professor/mostrarNotas", ProfessorController.mostrarNotas);
routes.get("/professor/dadosSemestre", ProfessorController.dadosSemestre);
routes.post("/professor/dashboard", ProfessorController.dashboard);
routes.post("/aluno/semestre", UsuarioController.verSemestre);

routes.post("/aluno/disciplina", UsuarioController.pesquisarDisciplina);
routes.post("/aluno/todas", UsuarioController.mostrarDisciplinas);
routes.post("/aluno/dashboard", UsuarioController.dashboard);

routes.get("/professor/editProfile", ProfessorController.GetEditProfile);
routes.put("/professor/editProfile", ProfessorController.editProfile);
routes.put("/aluno/editProfile", UsuarioController.editProfile);
routes.get("/aluno/editProfile", UsuarioController.GetEditProfile);

//routes.post("/aluno/registro", UsuarioController.store);
//routes.get("/aluno/show", UsuarioController.show);
//routes.post("/professor/registro", ProfessorController.store);
//routes.get("/professor/show", ProfessorController.show);
//routes.put("/aluno/atualizar", UsuarioController.update);
//routes.get("/aluno/index", UsuarioController.index);
//routes.delete("/aluno/delete", UsuarioController.delete);

//routes.put("/professor/atualizar", ProfessorController.update);
//routes.get("/professor/index", ProfessorController.index);
//routes.delete("/professor/delete", ProfessorController.delete);

export default routes;
