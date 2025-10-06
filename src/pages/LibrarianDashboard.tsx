import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Users, TrendingUp, Plus } from "lucide-react";
import { toast } from "sonner";
import libraryBg from "@/assets/library-background.jpg";

const LibrarianDashboard = () => {
  const [stats, setStats] = useState({ totalBooks: 0, activeIssues: 0, totalUsers: 0 });
  const [open, setOpen] = useState(false);
  const [issueData, setIssueData] = useState({
    userId: "",
    bookId: "",
    dueDate: "",
  });
  const [users, setUsers] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchBooks();
  }, []);

  const fetchStats = async () => {
    try {
      const [booksResult, transactionsResult, usersResult] = await Promise.all([
        supabase.from("books").select("id", { count: "exact", head: true }),
        supabase.from("transactions").select("id", { count: "exact", head: true }).eq("status", "issued"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        totalBooks: booksResult.count || 0,
        activeIssues: transactionsResult.count || 0,
        totalUsers: usersResult.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from("profiles").select("user_id, full_name, email");
    setUsers(data || []);
  };

  const fetchBooks = async () => {
    const { data } = await supabase
      .from("books")
      .select("id, title, available_copies")
      .gt("available_copies", 0);
    setBooks(data || []);
  };

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error("Not authenticated");

      const { error } = await supabase.from("transactions").insert({
        user_id: issueData.userId,
        book_id: issueData.bookId,
        issued_by: authData.user.id,
        due_date: issueData.dueDate,
        status: "issued",
      });

      if (error) throw error;

      toast.success("Book issued successfully!");
      setOpen(false);
      setIssueData({ userId: "", bookId: "", dueDate: "" });
      fetchStats();
      fetchBooks();
    } catch (error: any) {
      toast.error(error.message || "Failed to issue book");
    }
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Librarian Dashboard</h1>
            <p className="text-muted-foreground">Manage library operations and inventory.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Issue Book
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Issue Book</DialogTitle>
                <DialogDescription>Select user and book to create a new issue</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleIssueBook} className="space-y-4">
                <div className="space-y-2">
                  <Label>User</Label>
                  <Select value={issueData.userId} onValueChange={(value) => setIssueData({ ...issueData, userId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.user_id} value={user.user_id}>
                          {user.full_name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Book</Label>
                  <Select value={issueData.bookId} onValueChange={(value) => setIssueData({ ...issueData, bookId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select book" />
                    </SelectTrigger>
                    <SelectContent>
                      {books.map((book) => (
                        <SelectItem key={book.id} value={book.id}>
                          {book.title} ({book.available_copies} available)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={issueData.dueDate}
                    onChange={(e) => setIssueData({ ...issueData, dueDate: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Issue Book</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBooks}</div>
              <p className="text-xs text-muted-foreground">In library collection</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeIssues}</div>
              <p className="text-xs text-muted-foreground">Currently issued</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default LibrarianDashboard;
