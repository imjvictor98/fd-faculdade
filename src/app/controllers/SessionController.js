import jwt from "jsonwebtoken";
import promisify from "promisify";
import authConfig from "../../config/auth";
import Aluno from "../models/Aluno";
import Professor from "../models/Professor";
import checkPassword from "../helpers/checkPassword";

export default {
  async store(req, res) {
    const codigo = req.body.cod_aluno || req.body.cod_professor;
    const senha = req.body.senha;
    console.log(req.body);
    if (req.body.cod_aluno) {
      const aluno = await Aluno.findOne({ cod_aluno: codigo });

      if (!aluno) {
        return res.status(401).json({ error: "Aluno não encontrado!" });
      }

      if (!(await checkPassword(senha, aluno.usuario.senha))) {
        return res.status(401).json({ error: "Senha incorreta!" });
      }

      return res.json({
        user: {
          email: aluno.usuario.email,
          nome: aluno.usuario.nome,
          cod_aluno: aluno.cod_aluno
        },
        token: jwt.sign({ cod_aluno: codigo }, authConfig.secret, {
          expiresIn: authConfig.expiresIn
        })
      });
    } else if (req.body.cod_professor) {
      const professor = await Professor.findOne({ cod_professor: codigo });

      if (!professor) {
        return res.status(401).json({ error: "Professor não encontrado!" });
      }

      if (!(await checkPassword(senha, professor.usuario.senha))) {
        return res.status(401).json({ error: "Senha incorreta!" });
      }

      return res.json({
        user: {
          email: professor.usuario.email,
          nome: professor.usuario.nome,
          cod_professor: professor.cod_professor
        },
        token: jwt.sign({ cod_professor: codigo }, authConfig.secret, {
          expiresIn: authConfig.expiresIn
        })
      });
    }
  }
};
