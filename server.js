const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const fecha = new Date().toLocaleString();
  console.log(`[${fecha}] ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.json({
    mensaje: "Bienvenido a la API RESTful de Books Champion 2026",
    estado: "Servidor activo",
  });
});

app.get("/libros/buscar", async (req, res) => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, "libros.json"),
      "utf-8",
    );

    const libros = JSON.parse(data);
    const categoria = req.query.categoria;

    if (categoria) {
      const librosFiltrados = libros.filter(
        (b) => b.categoria.toLowerCase() === categoria.toLowerCase(),
      );

      if (librosFiltrados.length === 0) {
        return res.status(404).json({
          mensaje: "No se encontraron libros en esa categoría.",
        });
      }

      return res.json(librosFiltrados);
    }

    res.json(libros);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      mensaje: "Error interno al procesar la búsqueda.",
    });
  }
});

app.get("/libros", async (req, res) => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, "libros.json"),
      "utf-8",
    );

    const libros = JSON.parse(data);
    res.json(libros);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      mensaje: "Error interno al leer los libros.",
    });
  }
});

app.get("/libros/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (Number.isNaN(id) || id <= 0) {
      return res.status(400).json({
        mensaje: "ID inválido.",
      });
    }

    const data = await fs.readFile(
      path.join(__dirname, "libros.json"),
      "utf-8",
    );

    const libros = JSON.parse(data);

    const libroEncontrado = libros.find((b) => b.id === id);

    if (!libroEncontrado) {
      return res.status(404).json({
        mensaje: "No se encontró el libro solicitado.",
      });
    }

    res.json(libroEncontrado);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      mensaje: "Error interno del servidor.",
    });
  }
});

app.post("/libros", async (req, res) => {
  try {
    const nuevoLibro = req.body;

    console.log("Nuevo libro recibido:", nuevoLibro);

    const data = await fs.readFile(
      path.join(__dirname, "libros.json"),
      "utf-8",
    );

    const libros = JSON.parse(data);

    const newId =
      libros.length > 0 ? Math.max(...libros.map((b) => b.id)) + 1 : 1;

    const libroAInsertar = {
      ...nuevoLibro,
      id: newId,
    };

    libros.push(libroAInsertar);

    await fs.writeFile(
      path.join(__dirname, "libros.json"),
      JSON.stringify(libros, null, 2),
      "utf-8",
    );

    res.status(201).json({
      mensaje: "Libro agregado con éxito.",
      libro: libroAInsertar,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      mensaje: "Error al registrar el libro.",
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    mensaje: "Ruta no encontrada.",
  });
});

app.listen(PORT, () => {
  console.log(
    `Servidor de Books Champion corriendo en http://localhost:${PORT}`,
  );
});
