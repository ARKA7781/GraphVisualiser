// ----- Tabs -----
const tabs=document.querySelectorAll(".tab");
const contents=document.querySelectorAll(".tabContent");

tabs.forEach(tab=>{
  tab.addEventListener("click",()=>{
    tabs.forEach(t=>t.classList.remove("active"));
    tab.classList.add("active");

    contents.forEach(c=>c.classList.remove("active"));
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

const API = "https://graphvisualiser-1.onrender.com";

// ----- Polynomial -----
async function plotPolynomial(){
  let expr=document.getElementById("polyInput").value;
  let xmin=document.getElementById("polyXMin").value;
  let xmax=document.getElementById("polyXMax").value;
  let ymin=document.getElementById("polyYMin").value;
  let ymax=document.getElementById("polyYMax").value;
  let derivative=document.getElementById("showDerivative").checked;

  let url=`${API}/polynomial?expr=${encodeURIComponent(expr)}&xmin=${xmin}&xmax=${xmax}&derivative=${derivative}`;
  let res=await fetch(url);
  let data=await res.json();

  let traces=[{x:data.x,y:data.y,mode:"lines",name:"Polynomial"}];

  if(data.derivative){
    traces.push({
      x:data.x,
      y:data.derivative,
      mode:"lines",
      name:"Derivative",
      line:{dash:"dot"}
    });
  }

  Plotly.newPlot("polyGraph",traces,{
    xaxis:{range:[xmin,xmax]},
    yaxis:{range:[ymin,ymax]}
  });
}


// ----- Trig -----
async function plotTrig(){
  let func=document.getElementById("trigFunc").value;
  let A=document.getElementById("amp").value;
  let B=document.getElementById("freq").value;
  let C=document.getElementById("phase").value;
  let D=document.getElementById("shift").value;

  let url=`${API}/trig?func=${func}&A=${A}&B=${B}&C=${C}&D=${D}`;
  let res=await fetch(url);
  let data=await res.json();

  Plotly.newPlot("trigGraph",
    [{x:data.x,y:data.y,mode:"lines"}]);
}


// ----- Parametric -----
async function plotParametric(){
  let type=document.getElementById("paramType").value;
  let res=await fetch(`${API}/parametric?type=${type}`);
  let data=await res.json();

  Plotly.newPlot("paramGraph",
    [{x:data.x,y:data.y,mode:"lines"}]);
}


// ----- 3D -----
async function plot3D(){
  let expr=document.getElementById("threeDFunc").value;
  let res=await fetch(`${API}/surface?expr=${encodeURIComponent(expr)}`);
  let data=await res.json();

  Plotly.newPlot("threeDGraph",[
    {z:data.z,x:data.x,y:data.y,type:"surface"}
  ]);
}
