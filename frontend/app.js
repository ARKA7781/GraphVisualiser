/* ---------- TAB SWITCH ---------- */
const tabs=document.querySelectorAll(".tab");
const sections=document.querySelectorAll(".tabContent");

tabs.forEach(tab=>{
  tab.addEventListener("click",()=>{
    tabs.forEach(t=>t.classList.remove("active"));
    tab.classList.add("active");

    sections.forEach(s=>s.classList.remove("active"));
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

/* ---------- API ---------- */
const API="http://127.0.0.1:8000";

/* ---------- LOADER ---------- */
const loaderBar=document.getElementById("loaderBar");
const loaderProgress=document.getElementById("loaderProgress");

function showLoader(){
  loaderBar.style.display="block";
  loaderProgress.style.width="0%";
  let w=0;
  loaderProgress.timer=setInterval(()=>{
    if(w>=90) return;
    w+=3;
    loaderProgress.style.width=w+"%";
  },80);
}

function hideLoader(){
  clearInterval(loaderProgress.timer);
  loaderProgress.style.width="100%";
  setTimeout(()=> loaderBar.style.display="none",200);
}

/* ---------- SAFE PLOT ---------- */
let debounceTimer;
let plotting=false;

function safePlot(fn){
  clearTimeout(debounceTimer);
  debounceTimer=setTimeout(()=>{
    if(plotting) return;
    plotting=true;
    fn().finally(()=> plotting=false);
  },250);
}

/* ---------- POLYNOMIAL ---------- */
async function plotPolynomial(){
  showLoader();

  const expr=document.getElementById("polyInput").value;

  let xmin=Number(document.getElementById("polyXMin").value);
  let xmax=Number(document.getElementById("polyXMax").value);
  let ymin=Number(document.getElementById("polyYMin").value);
  let ymax=Number(document.getElementById("polyYMax").value);
  const derivative=document.getElementById("showDerivative").checked;

  if(xmin>xmax) [xmin,xmax]=[xmax,xmin];
  if(ymin>ymax) [ymin,ymax]=[ymax,ymin];

  const res=await fetch(
    `${API}/polynomial?expr=${encodeURIComponent(expr)}&xmin=${xmin}&xmax=${xmax}&derivative=${derivative}`
  );
  const data=await res.json();

  const traces=[{x:data.x,y:data.y,mode:"lines",name:"Polynomial",line:{width:3}}];

  if(data.derivative){
    traces.push({
      x:data.x,y:data.derivative,mode:"lines",
      name:"Derivative",line:{dash:"dot",width:2}
    });
  }

  await Plotly.newPlot("polyGraph", traces,{
    xaxis:{range:[xmin,xmax],fixedrange:true},
    yaxis:{range:[ymin,ymax],fixedrange:true}
  },{
    responsive:true,
    displayModeBar:false
  });

  hideLoader();
}

/* ---------- TRIG ---------- */
async function plotTrig(){
  showLoader();

  const func=document.getElementById("trigFunc").value;
  const A=document.getElementById("amp").value;
  const B=document.getElementById("freq").value;
  const C=document.getElementById("phase").value;
  const D=document.getElementById("shift").value;

  const res=await fetch(`${API}/trig?func=${func}&A=${A}&B=${B}&C=${C}&D=${D}`);
  const data=await res.json();

  await Plotly.newPlot("trigGraph",[{
    x:data.x,y:data.y,mode:"lines"
  }],{
    xaxis:{fixedrange:true},
    yaxis:{fixedrange:true}
  },{
    responsive:true,
    displayModeBar:false
  });

  hideLoader();
}

/* ---------- PARAMETRIC ---------- */
async function plotParametric(){
  showLoader();

  const type=document.getElementById("paramType").value;

  const res=await fetch(`${API}/parametric?type=${type}`);
  const data=await res.json();

  await Plotly.newPlot("paramGraph",[{
    x:data.x,y:data.y,mode:"lines"
  }],{
    xaxis:{fixedrange:true},
    yaxis:{fixedrange:true}
  },{
    responsive:true,
    displayModeBar:false
  });

  hideLoader();
}

/* ---------- 3D ---------- */
async function plot3D(){
  showLoader();

  const expr=document.getElementById("threeDFunc").value;

  const res=await fetch(`${API}/surface?expr=${encodeURIComponent(expr)}`);
  const data=await res.json();

  await Plotly.newPlot("threeDGraph",[
    {z:data.z,x:data.x,y:data.y,type:"surface"}
  ],{},{
    responsive:true,
    scrollZoom:false,
    displayModeBar:false
  });

  hideLoader();
}
