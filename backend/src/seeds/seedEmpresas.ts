import { AppDataSource } from "../data-source";
import { Empresas } from "../entities/Empresas";

export async function seedEmpresas() {
  const repository = AppDataSource.getRepository(Empresas);

  const empresasExistentes = await repository.count();
  if (empresasExistentes > 0) {
    console.log("Empresas já cadastradas. Pulando seed.");
    return;
  }

  const empresas = [
  { codigo: "PSG01", nome: "RES. PORTO SEGURO" },      
  { codigo: "PSG02", nome: "PORTO SEGURO 2" },
  { codigo: "CSUL", nome: "RES. CRUZEIRO DO SUL" },
  { codigo: "TG1", nome: "RES. TEREZINHA GLORIA" },
  { codigo: "GRAVE", nome: "GARAVELO SUL" },
  { codigo: "BE", nome: "RES. BOA ESPERANÇA" },
  { codigo: "ADDOM", nome: "ADMINISTRAÇÃO DOMINGOS/CUSTOS OBRAS" },
  { codigo: "ADMBE", nome: "RESIDENCIAL BOA ESPERANÇA/CUSTO OBRAS" },
  { codigo: "CWALT", nome: "COMENDADOR WALMOR" },
  { codigo: "FBC", nome: "FABRICAÇÃO DE BLOCOS DE CIMENTOS" },
  { codigo: "FBM", nome: "FABRICA DE MANILHAS" },
  { codigo: "INFIN", nome: "GESTÃO DE VENDAS" },
  { codigo: "JFC", nome: "JARDIM FLORENÇA (C)" },
  { codigo: "NATIV", nome: "NATIV" },
  { codigo: "SD135", nome: "STANDA DE VENDAS 135" },
  { codigo: "SEDE", nome: "CONSTRUÇÃO NOVA SEDE CASTEL" },
  { codigo: "LVB", nome: "LOTEAMENTO VEREDAS DOS BURITIS" },
  { codigo: "GREL", nome: "RES. BOA ESPERANÇA" },
  { codigo: "JFMOA", nome: "LOTEAMENTO JARDIM FLORENÇA" },
  { codigo: "EBEM", nome: "LOTEAMENTO CONDOMINIO BELA VISTA" },
  { codigo: "RESBS", nome: "LOTEAMENTO RESIDENCIAL BOM SUCESSO" },
  { codigo: "JPAM", nome: "SPE RESIDENCIAL JARDINS PAMPLONA LTDA" },
  { codigo: "MONIQ", nome: "LOTEAMENTO JARDIM CRISTAL" },
  { codigo: "TGLII", nome: "RES.TEREZINHA GLORIA II" },
  { codigo: "DPSIL", nome: "BOM SUCESSO II (DOMINGOS)" },
  { codigo: "PCSIL", nome: "BOM SUCESSO I (PIERRE)" },
  { codigo: "FJLAG", nome: "JARDIM DO LAGO" },
  { codigo: "LOTSB", nome: "LOT. SETOR BUENO" },
  { codigo: "RRFAG", nome: "RES. RIOS E FAGUNDES" },
  { codigo: "ADMAL", nome: "ADMINISTRAÇÃO DE ALGUEIS" },
  { codigo: "ADM", nome: "CASTEL GESTÃO ADM" },
  { codigo: "GCSUL", nome: "CRUZEIRO DO SUL" },
  { codigo: "GEBE", nome: "BOA ESPERANÇA" },
  { codigo: "GFLCA", nome: "JARDIM FLORENÇA CASTEL" },
  { codigo: "GJFLO", nome: "JARDINS FLORENÇA" },
  { codigo: "GLAGO", nome: "JARDIM DO LAGO" },
  { codigo: "GPSG", nome: "PORTO SEGURO" },
  { codigo: "GTG1", nome: "TEREZINHA GLORIA I" },
  { codigo: "GVEBU", nome: "VEREDA DOS BURITIS" },
  { codigo: "GWALT", nome: "COMENDADOR WALMOR" },
  { codigo: "GALD", nome: "CASAS SENADOR CANEDO" },
  { codigo: "FIVDC", nome: "VILLA DELFIORI" },
  { codigo: "ADMTF", nome: "ADMINISTRAÇÃO FAGUNDES JACOB IMOBILIARIA" },
  { codigo: "TBOE", nome: "BOA ESPERANÇA" },
  { codigo: "TCSUL", nome: "CRUZEIRO DO SUL" },
  { codigo: "TFJFC", nome: "JARDIM FLORENÇA" },
  { codigo: "TGRO", nome: "G RODRIGUES" },
  { codigo: "TJLAG", nome: "JARDIM DO LAGO" },
  { codigo: "TPSG", nome: "PORTO SEGURO" },
  { codigo: "TTG", nome: "TEZINHA GLORIA" },
  { codigo: "TTG2", nome: "TEREZINHA GLORIA 2" },
  { codigo: "RICER", nome: "RIVIERA DA COMENDA" },
  { codigo: "ADMRG", nome: "ADMINISTRAÇÃO RG PARTICIPAÇÕES IMOBILIARIAS" },
  { codigo: "RGBOE", nome: "BOA ESPERANÇA" },
  { codigo: "RGCSU", nome: "CRUZEIRO DO SUL" },
  { codigo: "RGGRO", nome: "G RODRIGUES" },
  { codigo: "RGJFC", nome: "JARDIM FLORENÇA" },
  { codigo: "RGJLA", nome: "JARDIM DO LAGO" },
  { codigo: "RGPSG", nome: "PORTO SEGURO" },
  { codigo: "RGTG", nome: "TEREZINHA GLORIA" },
  { codigo: "RGTG2", nome: "TEREZINHA GLORIA 2" },
  { codigo: "AP001", nome: "APROVAÇÃO" },
  { codigo: "CO001", nome: "COMERCIAL" },
  { codigo: "DE001", nome: "DESENVOLVIMENTO" },
  { codigo: "FI001", nome: "FINANCEIRO" },
  { codigo: "TX001", nome: "TAXA DE INCORPORAÇÃO" },
  { codigo: "VRNAT", nome: "VERTICAL NATIV 01" },
];

  for (const emp of empresas) {
    const empresa = repository.create(emp);
    await repository.save(empresa);
  }

  console.log("Empresas cadastradas com sucesso!");
}
