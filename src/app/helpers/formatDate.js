export default function(date) {
  var meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
  ];

  var dia = date.getDate();
  var mes = date.getMonth();
  var ano = date.getFullYear();
  var hora = date.getHours();
  var min = date.getMinutes();

  return `${dia} de ${meses[mes]} de ${ano} às ${hora}:${min}h`;
}
