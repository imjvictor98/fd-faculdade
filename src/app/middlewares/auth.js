import { promisify } from "util";
import jwt from "jsonwebtoken";
import authConfig from "../../config/auth";

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token inválido!" });
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    if (decoded.cod_aluno) {
      req.alunoToken = decoded.cod_aluno;
    }

    if (decoded.cod_professor) {
      req.professorToken = decoded.cod_professor;
    }

    console.log(
      "--> Auth.js: ",
      decoded,
      "REQ ALUNO TOKEN: ",
      req.alunoToken,
      "REQ PROF TOKEN: ",
      req.professorToken
    );
    return next();
  } catch (error) {
    return res.status(401).json(error);
  }
};
