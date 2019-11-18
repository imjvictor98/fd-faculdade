import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import authConfig from "../../config/auth";
import * as yup from "yup";
import Aluno from "../models/Aluno";
import Professor from "../models/Professor";
import checkPassword from "../helpers/checkPassword";
import hanaConnection from "../../config/hana";
import SessionController from "./SessionController";

export default {
  async verSemestre(req, res) {
    const alunoExiste = await Aluno.findOne({ cod_aluno: req.alunoToken });

    if (!alunoExiste) {
      return res.status(401).json({ error: "Aluno não encontrado" });
    }

    hanaConnection.connection.connect(hanaConnection.params, err => {
      if (err) {
        return res.status(401).json({ erro: `${err}` });
      }

      //-ME TRAZ O SEMESTRE, DISCIPLINA E A NOTA--
      const sql = `SELECT DISCIPLINA.ST_NOME_DISCIPLINA, HISTORICO.FL_NOTA_ALUNO, HISTORICO.IT_SEMESTRE
      FROM HISTORICO
      JOIN DISCIPLINA
      ON HISTORICO.INT_ID_DISCIPLINA = DISCIPLINA.INT_ID_DISCIPLINA
      WHERE HISTORICO.ST_COD_ALUNO = '${alunoExiste.cod_aluno}'`;

      hanaConnection.connection.exec(sql, (err, rows) => {
        hanaConnection.connection.disconnect();

        if (err) {
          return res.status(401).json({ error: `SQL execute error: ${err}` });
        }

        if (rows.length === 0) {
          return res.json({ error: "Sem resultados para esse usuário" });
        }

        let maior = rows[0].IT_SEMESTRE;

        for (let i = 0; i < rows.length; i++) {
          rows[i].IT_SEMESTRE > maior ? (maior = rows[i].IT_SEMESTRE) : maior;
        }

        return res.json({ disciplinas: rows, semestres: maior });
      });
    });
  },

  async mostrarDisciplinas(req, res) {
    const alunoExiste = await Aluno.findOne({
      cod_aluno: req.alunoToken
    });

    if (!alunoExiste) {
      return res.status(401).json({ error: "Aluno não encontrado" });
    }

    hanaConnection.connection.connect(hanaConnection.params, err => {
      if (err) {
        return res.status(401).json({ erro: `${err}` });
      }

      const sql = `     
      SELECT d.ST_NOME_DISCIPLINA, h.FL_NOTA_ALUNO, h.ST_COD_PROFESSOR, h.IT_SEMESTRE
      FROM HISTORICO h 
      JOIN DISCIPLINA d 
      ON h.INT_ID_DISCIPLINA = d.INT_ID_DISCIPLINA
      WHERE h.ST_COD_ALUNO = '${alunoExiste.cod_aluno}'
      ORDER BY h.IT_SEMESTRE, d.ST_NOME_DISCIPLINA;
      `;

      hanaConnection.connection.exec(sql, async (err, rows) => {
        hanaConnection.connection.disconnect();

        if (err) {
          return res.status(401).json({ error: `SQL execute error: ${err}` });
        }
        if (rows.length === 0) {
          return res.json({ error: "Sem resultados para esse usuário" });
        }

        for (var prop in rows) {
          var valor = rows[prop];

          const professor = await Professor.findOne({
            cod_professor: valor.ST_COD_PROFESSOR
          });

          if (valor.FL_NOTA_ALUNO == null) valor.FL_NOTA_ALUNO = "-";
          valor.ST_NOME_PROFESSOR = professor.usuario.nome;
        }

        return res.json({ resultado: rows });
      });
    });
  },

  async pesquisarDisciplina(req, res) {
    const alunoExiste = await Aluno.findOne({ cod_aluno: req.alunoToken });

    if (!alunoExiste) {
      return res.status(401).json({ error: "Aluno não encontrado" });
    }

    hanaConnection.connection.connect(hanaConnection.params, err => {
      if (err) {
        return res.status(401).json({ erro: `${err}` });
      }

      const { nomeDisciplina } = req.body;

      //-ME TRAZ O SEMESTRE, DISCIPLINA E A NOTA--
      const sql = `SELECT DISCIPLINA.ST_NOME_DISCIPLINA, HISTORICO.FL_NOTA_ALUNO, HISTORICO.ST_COD_PROFESSOR
      FROM HISTORICO
      JOIN DISCIPLINA
      ON HISTORICO.INT_ID_DISCIPLINA = DISCIPLINA.INT_ID_DISCIPLINA
      WHERE (LOWER(DISCIPLINA.ST_NOME_DISCIPLINA) LIKE LOWER('%${nomeDisciplina}%')
      AND HISTORICO.ST_COD_ALUNO = '${alunoExiste.cod_aluno}');`;

      hanaConnection.connection.exec(sql, async (err, rows) => {
        hanaConnection.connection.disconnect();

        if (err) {
          return res.status(401).json({ error: `SQL execute error: ${err}` });
        }
        if (rows.length === 0) {
          return res.json({ error: "Sem resultados para esse usuário" });
        }

        for (var prop in rows) {
          var valor = rows[prop];

          const professor = await Professor.findOne({
            cod_professor: valor.ST_COD_PROFESSOR
          });

          if (valor.FL_NOTA_ALUNO == null) valor.FL_NOTA_ALUNO = "-";
          valor.ST_NOME_PROFESSOR = professor.usuario.nome;
        }

        return res.json({ resultado: rows });
      });
    });
  },

  async signIn(req, res) {
    const { codigo } = req.body;
    const { senha } = req.body;

    console.log(req.body);
    const userExists = await Aluno.findOne({ cod_aluno: codigo });

    if (!userExists) {
      res.status(400).json({ error: "Aluno não encontrado" });
    }

    if (!(await checkPassword(senha, userExists.usuario.senha))) {
      res.status(401).json({ error: "Senha incorreta!" });
    }

    const token = jwt.sign({ cod_aluno: codigo }, authConfig.secret, {
      expiresIn: authConfig.expiresIn
    });

    res.json({
      cod_aluno: userExists.cod_aluno,
      token,
      user: {
        nome: userExists.usuario.nome,
        email: userExists.usuario.email,
        cpf: userExists.usuario.cpf,
        telefone: userExists.usuario.telefone,
        endereco: userExists.usuario.endereco
      }
    });
  },

  async signUp(req, res) {
    var codigo = "";
    var userExists = {};
    var seed = 1000;
    console.log(req.body);

    do {
      codigo = "A" + Math.floor(Math.random() * seed);
      userExists = Aluno.findOne({ cod_aluno: codigo });
    } while (codigo === userExists.cod_aluno);

    var dados = req.body;

    const hash = await bcrypt.hash(dados.usuario.senha, 8);

    dados.cod_aluno = codigo;
    dados.usuario.senha = hash;

    await Aluno.create(dados).then(() => console.log("Aluno criado"));

    return res
      .status(200)
      .json({ message: "Seu cadastro foi criado", Matricula: codigo });
  },

  async dashboard(req, res) {
    const User = await Aluno.findOne({ cod_aluno: req.alunoToken });

    console.log(User);

    return res.status(200).json({
      cod_aluno: User.cod_aluno,
      nome: User.usuario.nome,
      telefone: User.usuario.telefone,
      email: User.usuario.email,
      foto: User.usuario.foto
    });
  },

  async GetEditProfile(req, res) {
    const aluno = await Aluno.findOne({
      cod_aluno: req.alunoToken
    });
    const { nome, telefone, email } = aluno.usuario;

    res.status(200).json({
      nome,
      telefone,
      email
    });
  },

  async editProfile(req, res) {
    const schema = yup.object().shape({
      nome: yup.string(),
      email: yup.string().email(),
      telefone: yup.string().min(9)
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: "Campo inválido ou não preenchido!" });
    }

    const aluno = await Aluno.findOne({
      cod_aluno: req.alunoToken
    });

    const { nome, telefone, email } = req.body;

    if (email) {
      aluno.usuario.email = email;
      await aluno.save();
    }

    if (nome) {
      aluno.usuario.nome = nome;
      await aluno.save();
    }

    if (telefone) {
      aluno.usuario.telefone = telefone;
      await aluno.save();
    }

    return res.json({
      msg: "Dados alterados com sucesso!"
    });
  },

  async recoverPwd(req, res) {
    const schema = yup.object().shape({
      codigo: yup.string(),
      senha: yup.string().min(6),
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

    const { codigo, senha, confirmaSenha } = req.body;

    console.log(req.body);

    const aluno = await Aluno.findOne({ cod_aluno: codigo });

    if (senha === confirmaSenha) {
      aluno.usuario.senha = await bcrypt.hash(senha, 8);
      await aluno.save();
    } else {
      return res
        .status(401)
        .json({ error: "Os dois campos devem corresponder!" });
    }

    return res.status(200).json({ msg: "Senha alterada com sucesso!" });
  },

  async store(req, res) {
    const userExists = await Aluno.findOne({ cod_aluno: req.body.cod_aluno });

    if (userExists) {
      return res.status(400).json({ error: "Codigo de aluno repetido" });
    }

    var dados = req.body;

    const hash = await bcrypt.hash(dados.usuario.senha, 8);

    dados.usuario.senha = hash;

    await Aluno.create(dados).then(() => console.log(`Aluno criado`));

    return res.json(req.body).status(200);
  },

  async show(req, res) {
    if (Aluno.length <= 0) {
      return res
        .status(204)
        .json({ error: "Não existem usuários cadastrados" });
    }

    const map = [];
    await Aluno.find({}, (erro, usuarios) => {
      if (erro)
        return res
          .status(204)
          .json({ error: "Não foi possível percorrer o elemento" });
      usuarios.forEach(element => map.push(element));
    });

    return res.status(200).json(map);
  },

  async index(req, res) {
    const aluno = await Aluno.findOne({ cod_aluno: req.alunoToken });

    console.log("TOKEN: ", typeof req.alunoToken);

    console.log(aluno);
    if (!aluno) {
      res.status(401).json({ error: "Seu cadastro não foi encontrado!" });
    }

    const { usuario } = aluno;

    res.status(200).json({
      cod_aluno: aluno.cod_aluno,
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

    const aluno = await Aluno.findOne({ cod_aluno: req.alunoToken });

    const { usuario } = req.body;

    if (usuario.email) {
      aluno.usuario.email = usuario.email;
      await aluno.save();
    }

    if (usuario.senhaAntiga && usuario.senha && usuario.confirmaSenha) {
      if (!(await checkPassword(usuario.senhaAntiga, aluno.usuario.senha))) {
        res.status(401).json({ error: "Senha incorreta!" });
      }
      if (usuario.senha === usuario.confirmaSenha) {
        aluno.usuario.senha = await bcrypt.hash(usuario.senha, 8);
        await aluno.save();
      } else {
        return res
          .status(401)
          .json({ error: "Os dois campos devem corresponder!" });
      }
    }

    if (usuario.nome) {
      aluno.usuario.nome = usuario.nome;
      await aluno.save();
    }

    if (usuario.telefone) {
      aluno.usuario.telefone = usuario.telefone;
      await aluno.save();
    }

    if (usuario.endereco.estado) {
      aluno.usuario.endereco.estado = usuario.endereco.estado;
      await aluno.save();
    }

    if (usuario.endereco.cidade) {
      aluno.usuario.endereco.cidade = usuario.endereco.cidade;
      await aluno.save();
    }

    return res.json({
      cod_aluno: aluno.cod_aluno,
      nome: aluno.usuario.nome,
      email: aluno.usuario.email,
      cpf: aluno.usuario.cpf,
      telefone: aluno.usuario.telefone,
      endereco: aluno.usuario.endereco.estado,
      cidade: aluno.usuario.endereco.cidade
    });
  },

  async delete(req, res) {
    const aluno = await Aluno.findOne(req.alunoToken);

    if (!aluno) {
      res.status(401).json({ error: "Aluno não encontrado!" });
    }

    await aluno
      .remove()
      .then(() => res.json({ success: "Aluno excluído" }))
      .catch(() => res.json({ error: "Aluno não pode ser excluído" }));
  }
};
