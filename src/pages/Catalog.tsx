import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen } from "lucide-react";
import libraryBg from "@/assets/library-background.jpg";

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  total_copies: number;
  available_copies: number;
  description: string | null;
  publisher: string | null;
  publication_year: number | null;
}

const Catalog = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [searchTerm, categoryFilter, books]);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("title", { ascending: true });

      if (error) throw error;

      setBooks(data || []);
      
      const uniqueCategories = [...new Set(data?.map((book) => book.category) || [])];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = books;

    if (searchTerm) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.isbn.includes(searchTerm)
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((book) => book.category === categoryFilter);
    }

    setFilteredBooks(filtered);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.92), rgba(0, 0, 0, 0.92)), url(${libraryBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <Navbar />
      <main className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Book Catalog</h1>
          <p className="text-muted-foreground">Browse and search our collection.</p>
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>Find books by title, author, or ISBN</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading books...</p>
        ) : filteredBooks.length === 0 ? (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="py-12">
              <div className="text-center">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No books found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-[var(--shadow-glow)] transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={book.available_copies > 0 ? "default" : "destructive"}>
                      {book.available_copies > 0 ? "Available" : "Out of Stock"}
                    </Badge>
                    <Badge variant="outline">{book.category}</Badge>
                  </div>
                  <CardTitle className="text-lg">{book.title}</CardTitle>
                  <CardDescription>by {book.author}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {book.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{book.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-sm pt-2">
                    {book.publisher && (
                      <div>
                        <span className="text-muted-foreground">Publisher:</span>
                        <p className="font-medium">{book.publisher}</p>
                      </div>
                    )}
                    {book.publication_year && (
                      <div>
                        <span className="text-muted-foreground">Year:</span>
                        <p className="font-medium">{book.publication_year}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">ISBN:</span>
                      <p className="font-medium text-xs">{book.isbn}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Copies:</span>
                      <p className="font-medium">{book.available_copies} / {book.total_copies}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Catalog;
