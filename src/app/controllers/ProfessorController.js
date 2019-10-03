import bcrypt from "bcryptjs";
import * as yup from "yup";
import Professor from "../models/Professor";
import Aluno from "../models/Aluno";
import checkPassword from "../helpers/checkPassword";

export default {
  async store(req, res) {
    const professorExists = await Professor.findOne({
      cod_professor: req.body.cod_professor
    });

    if (professorExists) {
      return res.status(400).json({ error: "Codigo de professor repetido" });
    }

    var dados = req.body;

    const hash = await bcrypt.hash(dados.usuario.senha, 8);

    dados.usuario.senha = hash;

    await Professor.create(dados).then(() => console.log(`Professor criado`));

    return res.json(req.body).status(200);
  },

  async show(req, res) {
    if (Professor.length <= 0) {
      return res
        .status(204)
        .json({ error: "Não existem professores cadastrados" });
    }

    const map = [];
    await Professor.find({}, (erro, professores) => {
      if (erro)
        return res
          .status(204)
          .json({ error: "Não foi possível percorrer o elemento" });
      professores.forEach(element => map.push(element));
    });

    return res.status(200).json(map);
  },

  async index(req, res) {
    const professor = await Professor.findOne({
      cod_professor: req.professorToken
    });

    if (!professor) {
      res.status(401).json({ error: "Seu cadastro não foi encontrado!" });
    }

    const { usuario } = professor;

    res.status(200).json({
      cod_professor: professor.cod_professor,
      usuario
    });
  },

  async update(req, res) {
    const schema = yup.object().shape({
      nome: yup.string(),
      email: yup.string().email(),
      telefone: yup.string().min(9),
      senhaAntiga: yup.string().min(6),
      senha: yup
        .string()
        .min(6)
        .when("senhaAntiga", (senhaAntiga, field) =>
          senhaAntiga ? field.required().oneOf([yup.ref("senha")]) : field
        ),
      confirmaSenha: yup
        .string()
        .when("senha", (senha, field) =>
          senha ? field.required().oneOf([yup.ref("senha")]) : field
        )
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: "Campo inválido ou não preenchido!" });
    }

    const professor = await Professor.findOne({
      cod_professor: req.professorToken
    });

    const { usuario } = req.body;

    if (usuario.email) {
      professor.usuario.email = usuario.email;
      await aluno.save();
    }

    if (usuario.senhaAntiga && usuario.senha && usuario.confirmaSenha) {
      if (
        !(await checkPassword(usuario.senhaAntiga, professor.usuario.senha))
      ) {
        res.status(401).json({ error: "Senha incorreta!" });
      }
      if (usuario.senha === usuario.confirmaSenha) {
        professor.usuario.senha = await bcrypt.hash(usuario.senha, 8);
        await professor.save();
      } else {
        return res
          .status(401)
          .json({ error: "Os dois campos devem corresponder!" });
      }
    }

    if (usuario.nome) {
      professor.usuario.nome = usuario.nome;
      await professor.save();
    }

    if (usuario.telefone) {
      professor.usuario.telefone = usuario.telefone;
      await professor.save();
    }

    if (usuario.endereco.estado) {
      professor.usuario.endereco.estado = usuario.endereco.estado;
      await professor.save();
    }

    if (usuario.endereco.cidade) {
      professor.usuario.endereco.cidade = usuario.endereco.cidade;
      await professor.save();
    }

    return res.json({
      cod_professor: professor.cod_aluno,
      nome: professor.usuario.nome,
      email: professor.usuario.email,
      cpf: professor.usuario.cpf,
      telefone: professor.usuario.telefone,
      endereco: professor.usuario.endereco.estado,
      cidade: professor.usuario.endereco.cidade
    });
  },

  async delete(req, res) {
    const professor = await Professor.findOne({
      cod_professor: req.professorToken
    });

    if (!professor) {
      res.status(401).json({ error: "Professor não encontrado!" });
    }

    await professor
      .remove()
      .then(() => res.json({ success: "Professor excluído" }))
      .catch(() => res.json({ error: "Professor não pode ser excluído" }));
  },

  async lancarNotas(req, res) {
    /*
    SELECT HISTORICO.INT_COD_TURMA, HISTORICO.IT_SEMESTRE, DISCIPLINA.ST_NOME_DISCIPLINA, HISTORICO.FL_NOTA_ALUNO
    FROM HISTORICO
    INNER JOIN DISCIPLINA
    ON HISTORICO.INT_ID_DISCIPLINA = DISCIPLINA.INT_ID_DISCIPLINA
    INNER JOIN TURMA 
    ON HISTORICO.ST_COD_ALUNO = TURMA.ST_COD_ALUNO
    WHERE (HISTORICO.ST_COD_ALUNO = 'A2300' AND 
        HISTORICO.ST_COD_PROFESSOR = 'P2300' AND
        HISTORICO.INT_COD_TURMA = 1 AND
        HISTORICO.IT_SEMESTRE = 1
    );*/

    const professor = await Professorf.findOne({
      cod_professor: req.professorToken
    });

    if (!professor) {
      return res.status(401).json({ error: "Professor não existe" });
    }
  }
};
