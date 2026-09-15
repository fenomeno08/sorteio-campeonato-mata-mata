const timesDiv=document.getElementById("times"),cadastro=document.getElementById("cadastro"),campeonato=document.getElementById("campeonato"),bracket=document.getElementById("bracket"),tema=document.getElementById("tema");
let quantidade=16,grupoA=[],grupoB=[],jogos={};
let artilheiros=[],assistentes=[];
const fasesNomes={32:["32 AVOS","16 AVOS","QUARTAS","SEMIFINAIS","FINAL"],16:["OITAVAS","QUARTAS","SEMIFINAIS","FINAL"]};

function configurarTema(){
 document.body.classList.remove("copa","escuro");
 quantidade=tema.value==="copa"?32:16;
 if(tema.value==="copa")document.body.classList.add("copa");
 if(tema.value==="escuro")document.body.classList.add("escuro");
 const copa=quantidade===32;
 document.getElementById("quantidade").textContent=quantidade;
 document.getElementById("subtitulo").textContent=`${quantidade} times • sorteio • chaveamento • campeão`;
 document.getElementById("tituloCadastro").textContent=copa?"COPA DO MUNDO":"CHAMPIONS LEAGUE";
 document.getElementById("descricao").textContent=`Cadastre os ${quantidade} times para começar.`;
 const img=copa?"assets/worldcup.webp":"assets/champions.webp";
 document.getElementById("brandLogo").src=img;document.getElementById("heroSticker").src=img;document.getElementById("bracketLogo").src=img;
 criarCampos();
}

function criarCampos(){
 timesDiv.innerHTML="";
 for(let i=0;i<quantidade;i++){
  const g=i%2===0?"A":"B",n=Math.floor(i/2)+1;
  timesDiv.innerHTML+=`<div class="input-time"><b>${n}${g}</b><input id="t${i}" placeholder="Nome do time"></div>`;
 }
}

function criarCampoEstatistica(tipo){
 const div=document.getElementById(tipo);
 if(!div)return;
 div.innerHTML="";
 adicionarEstatistica(tipo);
}

function adicionarEstatistica(tipo,nome="",valor=""){
 const div=document.getElementById(tipo);
 const linha=document.createElement("div");
 linha.className="stat-input";
 linha.innerHTML=`
   <input class="stat-nome" placeholder="Nome do jogador" value="${esc(nome)}">
   <input class="stat-valor" type="number" min="0" step="1" placeholder="${tipo==="artilheiros"?"Gols":"Assist."}" value="${valor}">
   <button type="button" class="remove-stat" title="Remover">✕</button>
 `;
 linha.querySelector(".remove-stat").onclick=()=>linha.remove();
 div.appendChild(linha);
}

function lerEstatisticas(tipo){
 return [...document.querySelectorAll(`#${tipo} .stat-input`)]
  .map(l=>{
    const nome=l.querySelector(".stat-nome").value.trim();
    const valor=parseInt(l.querySelector(".stat-valor").value,10);
    return {nome,valor:Number.isFinite(valor)&&valor>=0?valor:0};
  })
  .filter(x=>x.nome);
}

function esc(v){
 return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function iniciarEstatisticas(){
 criarCampoEstatistica("artilheiros");
 criarCampoEstatistica("assistentes");
 document.getElementById("artilheiros").addEventListener("input",atualizarEstatisticasDigitadas);
 document.getElementById("assistentes").addEventListener("input",atualizarEstatisticasDigitadas);
}

function atualizarEstatisticasDigitadas(){
 artilheiros=lerEstatisticas("artilheiros");
 assistentes=lerEstatisticas("assistentes");
 mostrarRankings();
}

function exemplo(){
 const e=quantidade===16?["Real Madrid","Bayern","Barcelona","Manchester City","Liverpool","Inter","Arsenal","PSG","Chelsea","Milan","Juventus","Borussia Dortmund","Benfica","Porto","Atlético de Madrid","Ajax"]:["Brasil","Argentina","França","Espanha","Inglaterra","Portugal","Alemanha","Itália","Holanda","Croácia","Uruguai","Colômbia","Bélgica","México","Japão","Coreia do Sul","EUA","Canadá","Marrocos","Senegal","Nigéria","Suíça","Dinamarca","Áustria","Turquia","Polônia","Sérvia","Equador","Chile","Paraguai","Austrália","Arábia Saudita"];
 e.forEach((x,i)=>document.getElementById("t"+i).value=x);

 // Os jogadores NÃO são preenchidos pelo botão de exemplo.
 // O usuário cadastra os artilheiros e assistentes depois, manualmente.
}

function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function criarJogos(times,fase){let r=[];for(let i=0;i<times.length;i+=2)r.push({time1:times[i],time2:times[i+1],resultado:"",vencedor:null});jogos[fase]=r}

document.getElementById("sortear").onclick=()=>{
 let todos=[];
 for(let i=0;i<quantidade;i++){
  let n=document.getElementById("t"+i).value.trim();
  if(!n){alert(`Preencha todos os ${quantidade} times.`);return}
  todos.push(n)
 }
 artilheiros=lerEstatisticas("artilheiros");
 assistentes=lerEstatisticas("assistentes");

 grupoA=todos.filter((_,i)=>i%2===0);grupoB=todos.filter((_,i)=>i%2===1);
 let a=shuffle(grupoA),b=shuffle(grupoB),primeira=[];for(let i=0;i<a.length;i++)primeira.push(a[i],b[i]);
 const primeiraFase=quantidade===32?"32avos":"oitavas";jogos={};criarJogos(primeira,primeiraFase);
 cadastro.classList.add("hidden");campeonato.classList.remove("hidden");iniciarEstatisticas();mostrarGrupos();desenhar();mostrarRankings();
};

function mostrarGrupos(){
 document.getElementById("grupoA").innerHTML=grupoA.map(x=>`<span>${esc(x)}</span>`).join("");
 document.getElementById("grupoB").innerHTML=grupoB.map(x=>`<span>${esc(x)}</span>`).join("")
}

function vencedor(r,t1,t2){
 // Mantém o texto digitado separado da lógica de cálculo.
 // Aceita: 3x1, 3-1, 3:1 e pênaltis: 2(6)x2(5).
 const texto=String(r||"").trim();
 const normalizado=texto.replace(/\s+/g,"").replace(/[-:]/g,"x").replace(/×/g,"x").toLowerCase();
 const p=normalizado.split("x");
 if(p.length!==2)return null;

 function ler(x){
  const m=x.match(/^(\d+)(?:\((\d+)\))?$/);
  if(!m)return null;
  return {g:Number(m[1]),p:m[2]===undefined?null:Number(m[2])};
 }

 const a=ler(p[0]), b=ler(p[1]);
 if(!a||!b)return null;

 if(a.g>b.g)return t1;
 if(b.g>a.g)return t2;

 // Empate: só define vencedor quando os dois lados têm pênaltis.
 if(a.p===null||b.p===null)return null;
 if(a.p>b.p)return t1;
 if(b.p>a.p)return t2;
 return null;
}

function completa(f){return jogos[f]?.length>0&&jogos[f].every(j=>j.vencedor)}
function proxima(f){if(!completa(f))return;let v=jogos[f].map(j=>j.vencedor),ord=quantidade===32?["32avos","16avos","quartas","semifinais","final"]:["oitavas","quartas","semifinais","final"],i=ord.indexOf(f);if(i<ord.length-1)criarJogos(v,ord[i+1])}

function registrar(f,i,input){
 const j=jogos[f][i];
 // IMPORTANTÍSSIMO: guardamos exatamente o que o usuário digitou.
 // Não transformamos 2(6)x2(5) em nenhum outro placar.
 const r=String(input.value||"").trim();
 if(!r){ input.focus(); return; }

 const v=vencedor(r,j.time1,j.time2);
 if(!v){
  alert("Resultado inválido. Use 3x1 ou, em empate com pênaltis, 2(6)x2(5).");
  input.focus();
  return;
 }

 j.resultado=r;
 j.vencedor=v;

 // NÃO redesenha o chaveamento inteiro ao clicar em OK.
 // Isso evita o placar ser substituído e evita a página pular para outra partida.
 const game=input.closest('.game');
 if(game){
  const teams=game.querySelectorAll('.team');
  if(teams[0]){
   teams[0].classList.toggle('win',v===j.time1);
   teams[0].querySelector('b').textContent=v===j.time1?'✓':'';
  }
  if(teams[1]){
   teams[1].classList.toggle('win',v===j.time2);
   teams[1].querySelector('b').textContent=v===j.time2?'✓':'';
  }
  const status=game.querySelector('.status');
  if(status) status.textContent='Vencedor: '+j.vencedor;
  // Mantém exatamente o texto digitado no campo.
  input.value=r;
 }

 mostrarRankings();

 // Só cria a próxima fase quando TODOS os jogos da fase atual terminarem.
 if(completa(f)){
  const antes=Object.keys(jogos).length;
  proxima(f);
  if(Object.keys(jogos).length!==antes){
   adicionarNovaFase(f);
  }
 }
}

function adicionarNovaFase(fAnterior){
 const ordem=quantidade===32?["32avos","16avos","quartas","semifinais","final"]:["oitavas","quartas","semifinais","final"];
 const idx=ordem.indexOf(fAnterior);
 if(idx<0||idx>=ordem.length-1)return;
 const f=ordem[idx+1];
 if(!jogos[f])return;

 // Se a fase já estiver desenhada, não duplica.
 if([...bracket.querySelectorAll('.phase')].some(p=>p.dataset.fase===f))return;
 const c=document.createElement('div');
 c.className='phase';
 c.dataset.fase=f;
 c.innerHTML=`<h3>${fasesNomes[quantidade][idx+1]}</h3><div class="games"></div>`;
 const g=c.querySelector('.games');
 jogos[f].forEach((j,k)=>{
  g.insertAdjacentHTML('beforeend',jogoHTML(j,f,k));
  const card=g.lastElementChild;
  card.querySelector('button').onclick=()=>registrar(f,k,card.querySelector('input'));
 });
 bracket.insertBefore(c,bracket.querySelector('.phase:last-child'));
}
function jogoHTML(j,f,i){return `<div class="game"><div class="team ${j.vencedor===j.time1?"win":""}"><span>${esc(j.time1)}</span><b>${j.vencedor===j.time1?"✓":""}</b></div><div class="team ${j.vencedor===j.time2?"win":""}"><span>${esc(j.time2)}</span><b>${j.vencedor===j.time2?"✓":""}</b></div><div class="result"><input type="text" inputmode="text" autocomplete="off" spellcheck="false" value="${esc(j.resultado)}" placeholder="2x0"><button type="button">OK</button></div><div class="status">${j.vencedor?"Vencedor: "+esc(j.vencedor):"Aguardando resultado"}</div></div>`}

function desenhar(){
 bracket.innerHTML="";
 const ordem=quantidade===32?["32avos","16avos","quartas","semifinais","final"]:["oitavas","quartas","semifinais","final"];
 bracket.style.setProperty("--rounds",ordem.length+1);
 ordem.forEach((f,idx)=>{
  const c=document.createElement("div");
  c.className="phase";
  c.dataset.fase=f;
  c.innerHTML=`<h3>${fasesNomes[quantidade][idx]}</h3><div class="games"></div>`;
  const g=c.querySelector('.games');
  if(!jogos[f]){
   g.innerHTML='<div class="game"><div class="status">Aguardando fase anterior...</div></div>';
  }else{
   jogos[f].forEach((j,k)=>{
    g.insertAdjacentHTML('beforeend',jogoHTML(j,f,k));
    const card=g.lastElementChild;
    card.querySelector('button').onclick=()=>registrar(f,k,card.querySelector('input'));
   });
  }
  bracket.appendChild(c);
 });
 const c=document.createElement("div");
 c.className="phase";
 c.dataset.fase='campeao';
 c.innerHTML="<h3>🏆 CAMPEÃO</h3>";
 const ch=document.createElement("div");ch.className="champion";
 const jf=jogos.final?.[0],img=quantidade===32?"assets/worldcup.webp":"assets/champions.webp";
 ch.innerHTML=jf?.vencedor?`<img src="${img}"><div>${esc(jf.vencedor).toUpperCase()}</div><div>CAMPEÃO!</div>`:`<img src="${img}"><div>Aguardando a final</div>`;
 c.appendChild(ch);bracket.appendChild(c);
}
function agruparRanking(lista){
 const mapa=new Map();
 lista.forEach(x=>{
  const nome=x.nome.trim();
  if(!nome)return;
  mapa.set(nome,(mapa.get(nome)||0)+x.valor);
 });
 return [...mapa.entries()].map(([nome,valor])=>({nome,valor})).sort((a,b)=>b.valor-a.valor||a.nome.localeCompare(b.nome));
}

function renderRanking(elementId,lista,unidade){
 const el=document.getElementById(elementId);
 if(!el)return;
 if(!lista.length){el.innerHTML='<div class="sem-ranking">Aguardando você cadastrar os jogadores...</div>';return}
 el.innerHTML=lista.map((x,i)=>`
  <div class="ranking-row">
   <span class="pos">${i<3?["🥇","🥈","🥉"][i]:`${i+1}º`}</span>
   <b>${esc(x.nome)}</b>
   <strong>${x.valor} ${unidade}</strong>
  </div>`).join("");
}

function mostrarRankings(){
 const rg=agruparRanking(artilheiros),ra=agruparRanking(assistentes);
 renderRanking("rankingArtilheiros",rg,"gol"+(rg[0]?.valor===1?"":"s"));
 renderRanking("rankingAssistentes",ra,"assistência"+(ra[0]?.valor===1?"":"s"));

 const topG=rg[0]?.valor;
 const topA=ra[0]?.valor;
 const artilheirosTop=rg.filter(x=>x.valor===topG);
 const assistentesTop=ra.filter(x=>x.valor===topA);

 document.getElementById("artilheiroFinal").textContent=artilheirosTop.length?artilheirosTop.map(x=>`${x.nome} — ${x.valor} gol${x.valor===1?"":"s"}`).join(" • "):"Aguardando cadastro...";
 document.getElementById("assistenteFinal").textContent=assistentesTop.length?assistentesTop.map(x=>`${x.nome} — ${x.valor} assistência${x.valor===1?"":"s"}`).join(" • "):"Aguardando cadastro...";
}

tema.onchange=configurarTema;
document.getElementById("exemplo").onclick=exemplo;
document.getElementById("addArtilheiro").onclick=()=>adicionarEstatistica("artilheiros");
document.getElementById("addAssistente").onclick=()=>adicionarEstatistica("assistentes");
document.getElementById("novo").onclick=()=>{
 campeonato.classList.add("hidden");cadastro.classList.remove("hidden");jogos={};artilheiros=[];assistentes=[];criarCampos()
};
configurarTema();
