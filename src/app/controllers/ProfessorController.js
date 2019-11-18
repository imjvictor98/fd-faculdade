import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import checkPassword from "../helpers/checkPassword";
import authConfig from "../../config/auth";
import * as yup from "yup";
import Professor from "../models/Professor";
import Aluno from "../models/Aluno";
import checkPassword from "../helpers/checkPassword";
import hanaConnection from "../../config/hana";

export default {
  lancarNotas(req, res) {
    const { materia, usuarios } = req.body;
    const errorStatus = [];
    let sql = "";

    console.log("lancar notas", req.body);

    try {
      hanaConnection.connection.connect(hanaConnection.params, err => {
        usuarios.forEach(usuario => {
          if (usuario.FL_NOTA_ALUNO > 10 || usuario.FL_NOTA_ALUNO < 0) {
            throw "Nota deve ser válida!";
          }
          sql = `CALL ALTERARNOTA(${usuario.FL_NOTA_ALUNO}, '${usuario.ST_COD_ALUNO}', '${req.professorToken}', ${materia.turma}, ${materia.disciplina});`;
          hanaConnection.connection.exec(sql, (erro, status) => {
            hanaConnection.connection.end();
            if (erro) {
              return res.status(500).json({
                erro: "Erro interno no servidor"
              });
            }

            if (status === 0) {
              errorStatus.push(usuario.cod_aluno);
            }
          });
        });

        if (err) return res.status(401).json({ error: "bad request" });
      });
    } catch (error) {
      console.log(error);
    } finally {
      return res.json({ ok: true });
    }
  },

  async mostrarNotas(req, res) {
    const profExiste = await Professor.findOne({
      cod_professor: req.professorToken
    });

    if (!profExiste) {
      return res.status(401).json({ error: "Professor não encontrado" });
    }

    let { semestre, turma, disciplina } = req.body;
    console.log(req.body);

    hanaConnection.connection.connect(hanaConnection.params, erro => {
      if (erro) return res.status(401).json(erro);

      let sql = `SELECT d.ST_NOME_DISCIPLINA, h.FL_NOTA_ALUNO, h.ST_COD_ALUNO, d.INT_ID_DISCIPLINA
        FROM HISTORICO h
        JOIN DISCIPLINA d
        ON h.INT_ID_DISCIPLINA = d.INT_ID_DISCIPLINA
        WHERE (h.IT_SEMESTRE = ${semestre} AND
          h.ST_COD_PROFESSOR = '${profExiste.cod_professor}' AND
          h.INT_COD_TURMA = ${turma} AND
          (LOWER(d.ST_NOME_DISCIPLINA) LIKE LOWER('${disciplina}')));`;

      hanaConnection.connection.exec(sql, async (err, rows) => {
        hanaConnection.connection.disconnect();

        if (err) {
          return res.status(401).json({ error: `SQL execute error: ${err}` });
        }
        if (rows.length === 0 || rows === undefined) {
          return res.json({ error: "Sem resultados para essa pesquisa" });
        }

        for (var prop in rows) {
          var valor = rows[prop];
          if (valor.FL_NOTA_ALUNO == null) valor.FL_NOTA_ALUNO = "-";
        }
        console.log("uiii", rows);

        return res.json({ rows: rows });
      });
    });
  },

  async dadosSemestre(req, res) {
    const profExiste = await Professor.findOne({
      cod_professor: req.professorToken
    });

    if (!profExiste) {
      return res.status(401).json({ error: "Professor não encontrado" });
    }

    hanaConnection.connection.connect(hanaConnection.params, erro => {
      if (erro) return res.status(401).json(erro);

      let sql = ` SELECT h.IT_SEMESTRE, h.INT_COD_TURMA, d.ST_NOME_DISCIPLINA, h.ST_COD_ALUNO, h.FL_NOTA_ALUNO
      FROM HISTORICO h 
      JOIN DISCIPLINA d 
      ON (h.INT_ID_DISCIPLINA = d.INT_ID_DISCIPLINA)
      WHERE h.ST_COD_PROFESSOR = '${profExiste.cod_professor}'
      ORDER BY h.IT_SEMESTRE, h.INT_COD_TURMA,d.ST_NOME_DISCIPLINA;`;

      hanaConnection.connection.exec(sql, async (err, rows) => {
        hanaConnection.connection.disconnect();

        if (err) {
          return res.status(401).json({ error: `SQL execute error: ${err}` });
        }
        if (rows.length === 0 || rows === undefined) {
          return res.json({ error: "Sem resultados para essa pesquisa" });
        }

        let id_Semestres = rows[0].IT_SEMESTRE;
        let id_Turmas = rows[0].INT_COD_TURMA;
        let id_Disciplinas = rows[0].ST_NOME_DISCIPLINA;

        let ListSemestres = [];
        let ListTurmas = [];
        let ListDisciplinas = [];

        ListSemestres.push(id_Semestres);
        ListTurmas.push(id_Turmas);
        ListDisciplinas.push(id_Disciplinas);

        //let maiorSemestre = rows[0].IT_SEMESTRE;
        //let maiorTurma = rows[0].INT_COD_TURMA;

        for (let i = 0; i < rows.length; i++) {
          if (id_Semestres !== rows[i].IT_SEMESTRE) {
            ListSemestres.push(rows[i].IT_SEMESTRE);
          }
          if (id_Turmas !== rows[i].INT_COD_TURMA) {
            ListTurmas.push(rows[i].INT_COD_TURMA);
          }
          if (id_Disciplinas !== rows[i].ST_NOME_DISCIPLINA) {
            ListDisciplinas.push(rows[i].ST_NOME_DISCIPLINA);
          }
          /*
          rows[i].IT_SEMESTRE > maiorSemestre
            ? (maiorSemestre = rows[i].IT_SEMESTRE)
            : maiorSemestre;
          rows[i].INT_COD_TURMA > maiorTurma
            ? (maiorTurma = rows[i].INT_COD_TURMA)
            : maiorTurma;*/
        }
        console.log(ListSemestres, ListDisciplinas, ListTurmas);

        return res.json({
          disciplinas: rows,
          ListSemestres,
          ListTurmas,
          ListDisciplinas
        });
      });
    });
  },

  async dashboard(req, res) {
    console.log("Opa -> ", req.professorToken);
    try {
      const professorExists = await Professor.findOne({
        cod_professor: req.professorToken
      });

      return res.status(200).json({
        cod_professor: professorExists.cod_professor,
        nome: professorExists.usuario.nome,
        telefone: professorExists.usuario.telefone,
        email: professorExists.usuario.email,
        foto: professorExists.usuario.foto
      });
    } catch (error) {
      console.log("Erro: ", error);
    }
  },

  async signIn(req, res) {
    const { codigo } = req.body;
    const { senha } = req.body;

    console.log(req.body);
    const professorExists = await Professor.findOne({ cod_professor: codigo });

    if (!professorExists) {
      res.status(400).json({ error: "Professor não encontrado" });
    }

    if (!(await checkPassword(senha, professorExists.usuario.senha))) {
      res.status(401).json({ error: "Senha incorreta!" });
    }

    const token = jwt.sign({ cod_professor: codigo }, authConfig.secret, {
      expiresIn: authConfig.expiresIn
    });

    res.json({
      cod_professor: professorExists.cod_professor,
      token,
      user: {
        nome: professorExists.usuario.nome,
        email: professorExists.usuario.email,
        cpf: professorExists.usuario.cpf,
        telefone: professorExists.usuario.telefone,
        endereco: professorExists.usuario.endereco
      }
    });
  },

  async signUp(req, res) {
    var codigo = "";
    var professorExists = {};
    var seed = 1000;
    console.log(req.body);

    do {
      codigo = "P" + Math.floor(Math.random() * seed);
      professorExists = Professor.findOne({ cod_professor: codigo });
    } while (codigo === professorExists.cod_professor);

    var dados = req.body;

    const hash = await bcrypt.hash(dados.usuario.senha, 8);

    dados.cod_professor = codigo;
    dados.usuario.senha = hash;

    await Professor.create(dados).then(() => console.log("Professor criado"));

    return res
      .status(200)
      .json({ message: "Seu cadastro foi criado", Matricula: codigo });
  },

  async GetEditProfile(req, res) {
    const professor = await Professor.findOne({
      cod_professor: req.professorToken
    });
    const { nome, telefone, email } = professor.usuario;

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

    const professor = await Professor.findOne({
      cod_professor: req.professorToken
    });

    const { nome, telefone, email } = req.body;

    if (email) {
      professor.usuario.email = email;
      await professor.save();
    }

    if (nome) {
      professor.usuario.nome = nome;
      await professor.save();
    }

    if (telefone) {
      professor.usuario.telefone = telefone;
      await professor.save();
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

    const professor = await Professor.findOne({ cod_professor: codigo });

    if (senha && confirmaSenha) {
      if (senha === confirmaSenha) {
        professor.usuario.senha = await bcrypt.hash(senha, 8);
        await professor.save();
      } else {
        return res
          .status(401)
          .json({ error: "Os dois campos devem corresponder!" });
      }
    }

    return res.status(200).json({ msg: "Senha alterada com sucesso!" });
  },

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
  }
};
