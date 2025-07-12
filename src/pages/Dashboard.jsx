import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";
import { FaPen, FaTrash, FaSearch } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ title: "", price: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState("success");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFormMobile, setShowFormMobile] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const showToast = (message, type = "success") => {
    setToast(message);
    setToastType(type);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get("https://dummyjson.com/products", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setProducts(res.data.products);
    } catch {
      showToast("Gagal mengambil data produk", "danger");
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query) return fetchProducts();

    try {
      const res = await axios.get(
        `https://dummyjson.com/products/search?q=${query}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setProducts(res.data.products);
    } catch {
      showToast("Gagal mencari produk", "danger");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price) {
      showToast("Nama dan harga produk wajib diisi", "danger");
      return;
    }

    try {
      if (isEditing) {
        const res = await axios.put(
          `https://dummyjson.com/products/${editId}`,
          form,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const updatedProducts = products.map((p) =>
          p.id === editId ? { ...p, ...res.data } : p
        );
        setProducts(updatedProducts);
        showToast("Produk berhasil diupdate!");
      } else {
        const res = await axios.post(
          "https://dummyjson.com/products/add",
          form,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        setProducts([...products, res.data]);
        showToast("Produk berhasil ditambahkan!");
      }

      setForm({ title: "", price: "" });
      setIsEditing(false);
      setEditId(null);
      setShowFormMobile(false); // hide form on mobile after submit
    } catch {
      showToast("Gagal menyimpan data!", "danger");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus produk?")) return;

    try {
      await axios.delete(`https://dummyjson.com/products/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setProducts(products.filter((p) => p.id !== id));
      showToast("Produk berhasil dihapus!");
    } catch {
      showToast("Gagal menghapus produk", "danger");
    }
  };

  const handleEdit = (product) => {
    setForm({ title: product.title, price: product.price });
    setEditId(product.id);
    setIsEditing(true);
    setShowFormMobile(true); // open form on mobile for editing
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={() => setShowLogoutModal(true)}
          className="bg-red-500 text-white px-4 py-2 rounded font-bold flex items-center gap-2"
        >
          <IoLogOut size={24} />
          Logout
        </button>
      </div>

      {toast && (
        <Toast
          message={toast}
          type={toastType}
          onClose={() => setToast(null)}
        />
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Konfirmasi Logout</h2>
            <p className="mb-4">Apakah Anda yakin ingin logout?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 items-center gap-2 flex"
              >
                <IoLogOut size={24} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle button for mobile */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setShowFormMobile(!showFormMobile)}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
        >
          {showFormMobile ? "Tutup Form" : "Tambah Produk"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-auto md:h-[calc(100vh-150px)]">
        {/* Search + Form */}
        <div
          className={`${
            showFormMobile ? "block" : "hidden"
          } md:block md:col-span-1 space-y-4 overflow-y-auto`}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="title"
              placeholder="Nama Produk"
              value={form.title}
              onChange={handleChange}
              className="border rounded-md border-gray-200 p-3  w-full"
            />
            <input
              name="price"
              placeholder="Harga"
              value={form.price}
              onChange={handleChange}
              className="border rounded-md border-gray-200 p-3 w-full"
            />
            <button
              type="submit"
              className="bg-black text-white py-2 w-full rounded font-bold"
            >
              {isEditing ? "Update" : "Tambah"} Produk
            </button>
          </form>
        </div>

        {/* Produk list */}
        <div className="md:col-span-2 overflow-y-auto pr-2 scrollbar-hide">
          <div className="flex justify-end mb-4">
            <div className="relative w-full sm:w-1/2 md:w-1/3">
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full border border-gray-200 rounded-4xl p-3 pr-10 bg-slate-100 focus:outline-none"
              />
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex flex-col border p-4 rounded-md shadow h-48 border-slate-200"
              >
                <div className="flex-1 flex flex-col justify-between">
                  <h2 className="font-bold">{p.title}</h2>
                  <p className="text-sm text-gray-500">${p.price}</p>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm cursor-pointer"
                  >
                    <FaPen />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm cursor-pointer"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
