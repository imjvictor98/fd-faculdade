import Aluno from "../models/Aluno";
import Professor from "../models/Professor";
import formatDate from "../helpers/formatDate";

export default {
  async store(req, res) {
    const { originalname: name, filename: path } = req.file;

    console.log("REQUEST: ", req.file);

    if (req.alunoToken) {
      const aluno = await Aluno.findOneAndUpdate(
        {
          cod_aluno: req.alunoToken
        },
        {
          $set: {
            "usuario.foto": {
              name,
              path,
              uploaded_at: formatDate(new Date())
            }
          }
        },
        { new: true, strict: false }
      );

      return res.status(200).json({ aluno });
    }

    if (req.professorToken) {
      const professor = await Professor.findOneAndUpdate(
        {
          cod_professor: req.professorToken
        },
        {
          $set: {
            "usuario.foto": {
              name,
              path,
              uploaded_at: formatDate(new Date())
            }
          }
        },
        { new: true, strict: false }
      );

      return res.status(200).json({ professor });
    }
  }
};
