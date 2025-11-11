
const $=s=>document.querySelector(s);
const money=n=> (n).toFixed(2).replace('.',',')+' €';
function qs(k){return new URLSearchParams(location.search).get(k)}
function getCart(){try{return JSON.parse(localStorage.getItem('cart')||'[]')}catch(e){return[]}}
function setCart(c){localStorage.setItem('cart',JSON.stringify(c))}
function addToCart(it){const c=getCart();const i=c.findIndex(x=>x.id===it.id&&x.size===it.size&&x.version.name===it.version.name&&x.nameNumber==(it.nameNumber||''));if(i>-1){c[i].qty+=it.qty}else{c.push(it)}setCart(c);alert('Ajouté au panier ✅')}
function card(p){return `<article class="card"><a href="/product.html?id=${encodeURIComponent(p.id)}"><img src="${p.image}" alt="${p.title}"></a><div class="p"><div class="muted">${p.type}${p.league? ' • '+p.league:''}${p.continent? ' • '+p.continent:''}</div><h3 style="margin:6px 0"><a href="/product.html?id=${encodeURIComponent(p.id)}">${p.title}</a></h3><div class="price">${money(p.versions[0].price)}</div></div></article>`}

function renderGrid(limit=24){const grid=$('#grid');const db=(window.DB||[]);grid.innerHTML=db.slice(0,limit).map(card).join('');const btn=$('#btn-search');if(btn){btn.onclick=()=>{const q=$('#q').value;location.href='/pages/clubs.html?q='+encodeURIComponent(q)}}}

function paginate(items,perPage,page){const total=Math.max(1,Math.ceil(items.length/perPage));const p=Math.min(Math.max(1,page),total);const start=(p-1)*perPage;return {slice:items.slice(start,start+perPage),page:p,total}}

function renderList(ctx){const grid=$('#grid');const pager=$('#pager');let items=(window.DB||[]);
  const url=new URL(location.href); const q=(url.searchParams.get('q')||'').toLowerCase();
  if(q) items=items.filter(p=>(p.title+' '+(p.tags||[]).join(' ')+' '+(p.league||'')+' '+(p.continent||'')+' '+(p.season||'')).toLowerCase().includes(q));
  if(ctx.type) items=items.filter(p=>p.type===ctx.type);
  if(ctx.league) items=items.filter(p=>p.league===ctx.league);
  if(ctx.continent) items=items.filter(p=>p.continent===ctx.continent);
  if(ctx.decade) items=items.filter(p=>p.decade===ctx.decade);
  const per=ctx.perPage||48; const page=parseInt(qs('page')||'1',10);
  const {slice,page:pg,total}=paginate(items,per,page);
  grid.innerHTML=slice.map(card).join('');
  let html=''; for(let i=1;i<=total;i++){ const u=new URL(location.href); u.searchParams.set('page',i); html+=`<a href="${u.toString()}">${i}</a>` } pager.innerHTML=html;
}

function renderProduct(){const id=qs('id');const db=(window.DB||[]);const p=db.find(x=>x.id===id);const el=$('#p');if(!p){el.innerHTML='<p>Produit introuvable.</p>';return}
  let version=p.versions[0]; let size=(p.sizes[2]||p.sizes[0]); let patch=p.patches[0]; let qty=1; let nameNumber='';
  function priceFor(){let base=version.price; if(nameNumber.trim()) base+=10; if(patch!=='Aucun') base+=5; return base*qty;}
  el.innerHTML=`<div><img src="${p.image}" alt="${p.title}"></div><div>
    <h1>${p.title}</h1>
    <div class="muted"><span class="badge">${p.type}</span> ${p.league?`<span class="badge">${p.league}</span>`:''} ${p.continent?`<span class="badge">${p.continent}</span>`:''} <span class="badge">Saison ${p.season}</span></div>
    <p class="muted">${p.description||''}</p>
    <div><strong>Version</strong><div class="variant" id="v"></div></div>
    <div><strong>Taille</strong><div class="variant" id="s"></div></div>
    <div><strong>Patch</strong><div class="variant" id="pa"></div></div>
    <div><strong>Flocage (optionnel)</strong><div><input id="nn" placeholder="Nom & Numéro (ex: MBAPPÉ 7)"></div></div>
    <div><strong>Prix</strong> <span id="price" class="price"></span></div>
    <div class="variant"><button id="minus" class="button button--ghost">−</button><span id="qv">1</span><button id="plus" class="button button--ghost">+</button></div>
    <button class="button button--brand" id="add">Ajouter au panier</button>
    <div class="muted" style="margin-top:10px">• Fan = standard • Player = ajustée • Elite = premium — Flocage +10€, Patch +5€</div>
  </div>`;
  function renderBtns(id,list,cur,sel){const c=$(id);c.innerHTML=list.map(x=>`<button aria-pressed="${(x.name||x)===(cur.name||cur)}" data-v="${x.name||x}">${x.name||x}</button>`).join('');c.querySelectorAll('button').forEach(b=>b.onclick=()=>{const val=list.find(x=>(x.name||x)==b.dataset.v);sel(val||b.dataset.v)})}
  renderBtns('#v',p.versions,version,(v)=>{version=v;update()}); renderBtns('#s',p.sizes,size,(v)=>{size=v;update()}); renderBtns('#pa',p.patches,patch,(v)=>{patch=v;update()});
  $('#plus').onclick=()=>{qty++;update()}; $('#minus').onclick=()=>{qty=Math.max(1,qty-1);update()}; $('#nn').oninput=(e)=>{nameNumber=e.target.value;update()};
  $('#add').onclick=()=>{addToCart({id:p.id,title:p.title,price:priceFor()/qty,qty,image:p.image,version,patch,size,nameNumber})};
  function update(){ $('#price').textContent=money(priceFor()); $('#qv').textContent=qty; renderBtns('#v',p.versions,version,(v)=>{version=v;update()}); renderBtns('#s',p.sizes,size,(v)=>{size=v;update()}); renderBtns('#pa',p.patches,patch,(v)=>{patch=v;update()}); }
  update();
}

function renderCart(){const c=getCart();const list=$('#cart');if(c.length===0){list.innerHTML='<p class="muted">Votre panier est vide.</p>'}else{list.innerHTML=c.map(x=>`<div class="cart-item"><img src="${x.image}" alt=""><div><div><strong>${x.title}</strong></div><div class="muted">${x.version.name} — ${x.size}${x.nameNumber?' — '+x.nameNumber:''}${x.patch!=='Aucun'?' — '+x.patch:''}</div></div><div>× ${x.qty}</div><div class="price">€${(x.price*x.qty).toFixed(2)}</div></div>`).join('')}const total=c.reduce((a,b)=>a+b.price*b.qty,0).toFixed(2);document.getElementById('total').textContent='€'+total}

document.addEventListener('DOMContentLoaded',()=>{
  const e=document.body.getAttribute('data-page');
  if(e==='home'){ renderGrid(24); const btn=$('#btn-search'); if(btn){btn.onclick=()=>{const q=$('#q').value; location.href='/pages/clubs.html?q='+encodeURIComponent(q)}} }
  if(e==='list'){ const ctx=JSON.parse(document.body.getAttribute('data-ctx')||'{}'); renderList(ctx); }
  if(e==='product'){ renderProduct(); }
  if(e==='cart'){ renderCart(); $('#btn-checkout').onclick=()=>alert('Checkout démo : ajoute ton numéro WhatsApp dans une version serveur/Stripe'); }
});
