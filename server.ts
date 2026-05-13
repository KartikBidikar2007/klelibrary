import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "db.json");

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  quantity: number;
  amount: number;
  category: string;
  cover?: string;
  specializedSkill?: string;
}

async function initDB() {
  try {
    await fs.access(DB_PATH);
  } catch {
    const initialBooks: Book[] = [
      { 
        id: "1", 
        title: "Introduction to Algorithms", 
        author: "Thomas H. Cormen", 
        isbn: "978-0262033848", 
        quantity: 12, 
        amount: 850,
        category: "Computer Science",
        cover: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=800&auto=format&fit=crop",
        specializedSkill: "Data Extraction"
      },
      { 
        id: "2", 
        title: "Principles of Microeconomics", 
        author: "N. Gregory Mankiw", 
        isbn: "978-0357133514", 
        quantity: 8, 
        amount: 620,
        category: "Economics",
        cover: "https://m.media-amazon.com/images/I/81ywT3kSNxL._AC_UF1000,1000_QL80_.jpg",
        specializedSkill: "Strategic Resource Scaling"
      },
      { 
        id: "3", 
        title: "The Great Gatsby", 
        author: "F. Scott Fitzgerald", 
        isbn: "978-0743273565", 
        quantity: 5, 
        amount: 350,
        category: "Literature",
        cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop",
        specializedSkill: "Cognitive Synthesis"
      },
      { 
        id: "4", 
        title: "Principles of Microeconomics", 
        author: "H.L. Ahuja", 
        isbn: "978-9352533305", 
        quantity: 15, 
        amount: 780,
        category: "Economics",
        cover: "/src/assets/images/regenerated_image_1778648672015.jpeg",
        specializedSkill: "Strategic Resource Scaling"
      },
      { 
        id: "5", 
        title: "HELI HOGU KARANA", 
        author: "Dr. H.L. Pushpa", 
        isbn: "978-8194444555", 
        quantity: 10, 
        amount: 450,
        category: "Literature",
        cover: "https://rukminim2.flixcart.com/image/1280/1280/xif0q/regionalbooks/o/k/n/heli-hogu-kaarana-original-imahkjbnyetmtbnz.jpeg?q=90",
        specializedSkill: "Linguistic Precision"
      },
      { 
        id: "6", 
        title: "Vikram General Knowledge (English Medium)", 
        author: "Vikram Publishers", 
        isbn: "978-9384761554", 
        quantity: 25, 
        amount: 180,
        category: "General Knowledge",
        cover: "https://www.vikrambooks.com/cdn/shop/products/GKTitle-2023_EM_800x.jpg?v=1672980273",
        specializedSkill: "Localized Exam Mapping"
      },
      { 
        id: "7", 
        title: "The Alchemist", 
        author: "Paulo Coelho", 
        isbn: "978-0062315007", 
        quantity: 12, 
        amount: 420,
        category: "Literature",
        cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop",
        specializedSkill: "Narrative Weaving"
      },
      { 
        id: "8", 
        title: "The Mahabharata", 
        author: "C. Rajagopalachari", 
        isbn: "978-8172763688", 
        quantity: 7, 
        amount: 550,
        category: "Mythology",
        cover: "https://cdn.exoticindia.com/images/products/original/books/nze244.webp",
        specializedSkill: "Epic Forethought"
      },
      { 
        id: "9", 
        title: "The Ramayana", 
        author: "C. Rajagopalachari", 
        isbn: "978-8172763695", 
        quantity: 9, 
        amount: 550,
        category: "Mythology",
        cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSt5Fw1rbUTYPofsDxo0m7Z6uKAaBNJjL6iaA&s",
        specializedSkill: "Virtue Allocation"
      },
    ];
    await fs.writeFile(DB_PATH, JSON.stringify({ books: initialBooks }, null, 2));
  }
}

async function getBooks(): Promise<Book[]> {
  const data = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(data).books;
}

async function saveBooks(books: Book[]) {
  await fs.writeFile(DB_PATH, JSON.stringify({ books }, null, 2));
}

async function startServer() {
  await initDB();
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/books", async (req, res) => {
    const books = await getBooks();
    res.json(books);
  });

  app.post("/api/books/:id/enroll", async (req, res) => {
    const { id } = req.params;
    let books = await getBooks();
    const index = books.findIndex((b) => b.id === id);
    if (index !== -1) {
      if (books[index].quantity > 0) {
        books[index].quantity -= 1;
        await saveBooks(books);
        res.json(books[index]);
      } else {
        res.status(400).json({ error: "Asset depleted" });
      }
    } else {
      res.status(404).send("Asset not found");
    }
  });

  app.post("/api/books", async (req, res) => {
    const books = await getBooks();
    const newBook = { ...req.body, id: Date.now().toString() };
    books.push(newBook);
    await saveBooks(books);
    res.status(201).json(newBook);
  });

  app.put("/api/books/:id", async (req, res) => {
    const { id } = req.params;
    let books = await getBooks();
    const index = books.findIndex((b) => b.id === id);
    if (index !== -1) {
      books[index] = { ...books[index], ...req.body };
      await saveBooks(books);
      res.json(books[index]);
    } else {
      res.status(404).send("Book not found");
    }
  });

  app.delete("/api/books/:id", async (req, res) => {
    const { id } = req.params;
    let books = await getBooks();
    books = books.filter((b) => b.id !== id);
    await saveBooks(books);
    res.status(204).send();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
