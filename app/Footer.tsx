import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex flex-col sm:flex-row justify-between gap-3 px-6 py-6">
      <p className="text-sm sm:text-base text-muted font-sans cursor-default">{new Date().getFullYear()} © Shahzaib Ahmad Shahid</p>
      <Link
        href="#"
        className="text-sm sm:text-base text-muted hover:text-foreground hover:underline underline-offset-4 font-sans"
      >
        Contact Me
      </Link>
    </footer>
  );
}
