import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Professor = new Schema({
  cod_professor: {
    type: String
  },

  usuario: {
    cpf: {
      type: String
    },

    nome: {
      type: String
    },

    email: {
      type: String
    },

    senha: {
      type: String
    },

    telefone: {
      type: String
    },

    endereco: {
      estado: {
        type: String
      },

      cidade: {
        type: String
      }
    }
  }
});

export default mongoose.model("Professor", Professor, "professor");
