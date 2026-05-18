import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-[1080px] border-x border-rule p-[60px_30px]">
      <h1 className="font-serif text-[40px] font-semibold">Not found</h1>
      <p className="mt-4">
        That page does not exist.{" "}
        <Link href="/" className="underline hover:bg-ink hover:text-paper">
          Return home
        </Link>
        .
      </p>
    </main>
  );
}
