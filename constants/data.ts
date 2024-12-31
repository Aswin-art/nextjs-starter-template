import { User } from "@/types";

// User Data
export const users: User[] = [
  {
    id: "1",
    name: "Candice Schiner",
    email: null,
    image: null,
    role: "USER"
  },
  {
    id: "2",
    name: "John Doe",
    email: null,
    image: null,
    role: "ADMIN"
  },
  {
    id: "3",
    name: "Alice Johnson",
    email: null,
    image: null,
    role: "USER"
  }
];

// Navbar Items
export const navItems = [
  {
    name: "Beranda",
    url: "/"
  },
  {
    name: "Komunitas",
    url: "/communities"
  },
  {
    name: "Event",
    url: "/events"
  }
];
