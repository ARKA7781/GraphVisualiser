from fastapi import FastAPI
from fastapi import Query
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import sympy as sp
import math

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Backend is running 🚀"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to domain when deploying
    allow_methods=["*"],
    allow_headers=["*"],
)

x = sp.Symbol('x')
y = sp.Symbol('y')

# ---------------- POLYNOMIAL API ----------------
@app.get("/polynomial")
def polynomial(expr: str, xmin: float, xmax: float, resolution: int = 500, derivative: bool = False):
    expr = expr.replace("^","**")
    f = sp.sympify(expr)
    f_lambda = sp.lambdify(x, f, "numpy")

    x_vals = np.linspace(xmin, xmax, resolution)
    y_vals = f_lambda(x_vals).tolist()

    response = {"x": x_vals.tolist(), "y": y_vals}

    if derivative:
        d = sp.diff(f, x)
        d_lambda = sp.lambdify(x, d, "numpy")
        dy_vals = d_lambda(x_vals).tolist()
        response["derivative"] = dy_vals

    return response


# ---------------- TRIG API ----------------

@app.get("/trig")
def trig(
    trig_func: str = Query(..., alias="func"),
    A: float = 1,
    B: float = 1,
    C: float = 0,
    D: float = 0
):
    trig_func = trig_func.lower()
    x_vals = np.linspace(-20, 20, 1000)

    if trig_func == "sin":
        y_vals = A*np.sin(B*x_vals + C)+D
    elif trig_func == "cos":
        y_vals = A*np.cos(B*x_vals + C)+D
    elif trig_func == "tan":
        y_vals = A*np.tan(B*x_vals + C)+D
    elif trig_func == "sec":
        y_vals = A/np.cos(B*x_vals + C)+D
    elif trig_func in ["cosec","csc"]:
        y_vals = A/np.sin(B*x_vals + C)+D
    elif trig_func == "cot":
        y_vals = A/np.tan(B*x_vals + C)+D
    else:
        return {"error": "Invalid trig function"}

    # prevent NaN breaking JSON
    y_vals = np.where(np.abs(y_vals) > 1e4, None, y_vals)

    return {"x": x_vals.tolist(), "y": y_vals.tolist()}


# ---------------- 3D SURFACE API ----------------
@app.get("/surface")
def surface(expr: str):
    expr = expr.replace("^","**")
    f = sp.sympify(expr)
    f_lambda = sp.lambdify((x,y), f, "numpy")

    X = np.linspace(-10, 10, 40)
    Y = np.linspace(-10, 10, 40)
    XX, YY = np.meshgrid(X, Y)
    ZZ = f_lambda(XX, YY)

    return {"x": X.tolist(), "y": Y.tolist(), "z": ZZ.tolist()}


# ---------------- PARAMETRIC API ----------------
@app.get("/parametric")
def parametric(type: str):
    t = np.linspace(0, 20, 1000)

    if type=="circle":
        x_vals = np.cos(t)
        y_vals = np.sin(t)
    elif type=="heart":
        x_vals = 16*np.sin(t)**3
        y_vals = 13*np.cos(t) - 5*np.cos(2*t) - 2*np.cos(3*t) - np.cos(4*t)
    elif type=="butterfly":
        x_vals = np.sin(t)*(np.exp(np.cos(t))-2*np.cos(4*t)+(np.sin(t/12))**5)
        y_vals = np.cos(t)*(np.exp(np.cos(t))-2*np.cos(4*t)+(np.sin(t/12))**5)
    else:
        x_vals = np.sin(5*t)*np.cos(t)
        y_vals = np.sin(5*t)*np.sin(t)

    return {"x": x_vals.tolist(), "y": y_vals.tolist()}
