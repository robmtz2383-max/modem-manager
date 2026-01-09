import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, LogOut } from "lucide-react";

const FIREBASE_URL = "https://gestor-modems-default-rtdb.firebaseio.com";

export default function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [modems, setModems] = useState([]);
  const [form, setForm] = useState({ tienda: "", proveedor: "", serie: "" });
  const [search, setSearch] = useState("");

  /* =========================
     FIREBASE HELPERS
  ========================= */
  const fbGet = async (path) => {
    try {
      const r = await fetch(`${FIREBASE_URL}/${path}.json`);
      return r.ok ? await r.json() : null;
    } catch {
      return null;
    }
  };

  const fbSet = async (path, data) => {
    try {
      const r = await fetch(`${FIREBASE_URL}/${path}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return r.ok;
    } catch {
      return false;
    }
  };

  /* =========================
     LOAD INITIAL DATA
  ========================= */
  useEffect(() => {
    fbGet("users").then((d) => setUsers(d ? Object.values(d) : []));
  }, []);

  useEffect(() => {
    if (user) {
      fbGet(`modems/${user.id}`).then((d) =>
        setModems(d ? Object.values(d) : [])
      );
    }
  }, [user]);

  /* =========================
     AUTH
  ========================= */
  const login = () => {
    const u = users.find(
      (x) =>
        x.usuario === form.usuario && x.contraseña === form.contraseña
    );
    if (!u) return alert("Credenciales incorrectas");
    setUser(u);
    setForm({});
  };

  const logout = () => {
    setUser(null);
    setModems([]);
  };

  /* =========================
     MODEMS
  ========================= */
  const saveModem = async () => {
    if (!form.tienda || !form.serie) {
      alert("Campos obligatorios");
      return;
    }

    const nuevo = { ...form, id: "m" + Date.now() };
    const lista = [...modems, nuevo];

    const obj = {};
    lista.forEach((m, i) => (obj["m" + i] = m));

    if (await fbSet(`modems/${user.id}`, obj)) {
      setModems(lista);
      setForm({ tienda: "", proveedor: "", serie: "" });
    }
  };

  const deleteModem = async (id) => {
    const lista = modems.filter((m) => m.id !== id);
    const obj = {};
    lista.forEach((m, i) => (obj["m" + i] = m));

    if (await fbSet(`modems/${user.id}`, obj)) {
      setModems(lista);
    }
  };

  /* =========================
     FILTER
  ========================= */
  const filteredModems = modems.filter((m) =>
    `${m.tienda} ${m.proveedor} ${m.serie}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  /* =========================
     LOGIN VIEW
  ========================= */
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded shadow w-80 space-y-3">
          <h1 className="text-xl font-bold text-center">Gestor de Módems</h1>
          <input
            placeholder="Usuario"
            className="w-full border p-2 rounded"
            onChange={(e) =>
              setForm((p) => ({ ...p, usuario: e.target.value }))
            }
          />
          <input
            placeholder="Contraseña"
            type="password"
            className="w-full border p-2 rounded"
            onChange={(e) =>
              setForm((p) => ({ ...p, contraseña: e.target.value }))
            }
          />
          <button
            onClick={login}
            className="w-full bg-blue-600 text-white p-2 rounded"
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  /* =========================
     MAIN VIEW
  ========================= */
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Módems</h2>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded"
          >
            <LogOut size={16} /> Salir
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          <input
            placeholder="Tienda"
            value={form.tienda || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, tienda: e.target.value }))
            }
            className="border p-2 rounded"
          />
          <input
            placeholder="Proveedor"
            value={form.proveedor || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, proveedor: e.target.value }))
            }
            className="border p-2 rounded"
          />
          <input
            placeholder="Serie"
            value={form.serie || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, serie: e.target.value }))
            }
            className="border p-2 rounded"
          />
          <button
            onClick={saveModem}
            className="bg-green-600 text-white rounded flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Guardar
          </button>
        </div>

        <input
          placeholder="Buscar..."
          className="border p-2 rounded w-full mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filteredModems.length === 0 ? (
          <p className="text-center text-gray-500">No hay módems</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filteredModems.map((m) => (
              <div key={m.id} className="border p-3 rounded">
                <p className="font-bold">{m.tienda}</p>
                <p>{m.proveedor}</p>
                <p className="text-sm text-gray-600">{m.serie}</p>
                <button
                  onClick={() => deleteModem(m.id)}
                  className="mt-2 text-red-600 flex items-center gap-1"
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
