import * as duckdb from "https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.29.0/+esm";

// inicia o duckdb no navegador (exemplo da documentação do duckdb-wasm)
export async function iniciarDuckDB(){
  const bundles = duckdb.getJsDelivrBundles();
  const bundle = await duckdb.selectBundle(bundles);
  const workerUrl = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker}");`], { type: "text/javascript" })
  );
  const worker = new Worker(workerUrl);
  const db = new duckdb.AsyncDuckDB(new duckdb.VoidLogger(), worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  URL.revokeObjectURL(workerUrl);
  return db;
}

// carrega um csv da pasta data para o duckdb
export async function carregarCsv(db, arquivo){
  const resposta = await fetch("data/" + arquivo);
  const texto = await resposta.text();
  await db.registerFileText(arquivo, texto);
}

// roda uma consulta e devolve um array de objetos
export async function consulta(conn, sql){
  const resultado = await conn.query(sql);
  return resultado.toArray().map(linha => linha.toJSON());
}
