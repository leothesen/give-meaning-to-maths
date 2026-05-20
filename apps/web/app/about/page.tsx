import Image from "next/image";
import { BOOK } from "@/content/book";

export default function About() {
  return (
    <main className="mx-auto max-w-[1080px] border-x border-rule pb-[60px]">
      <div className="grid grid-cols-[220px_1fr] border-b border-rule max-[900px]:grid-cols-1">
        <div className="border-r border-rule p-[26px_28px] max-[900px]:border-b max-[900px]:border-r-0">
          <span className="font-mono text-[10px] font-semibold tracking-[.18em] uppercase">
            Section
          </span>
          <div className="mt-1 font-mono text-[12px] tracking-[.14em] uppercase">
            About the author
          </div>
        </div>
        <div className="p-[26px_28px]">
          <h1 className="m-0 font-serif text-[48px] font-semibold leading-[1.1]">
            <em className="italic">PeeBee</em>
          </h1>
        </div>
      </div>

      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <td className="border border-rule p-[26px_28px] align-top first:border-l-0">
              <p className="m-0 font-serif text-[17px] leading-[1.6] text-ink">
                The author has had{" "}
                <strong className="font-semibold">47 years</strong> of teaching
                Mathematics at all levels; marking final examination papers for{" "}
                <strong className="font-semibold">34 years</strong> and
                addressing symposia on selected topics.
              </p>

              <blockquote className="mt-6 border-l-2 border-rule pl-[18px] font-serif text-[17px] leading-[1.6] text-ink2">
                <p className="m-0">
                  <em>Give Meaning to Maths</em> invites you to look for the
                  meaning behind what you are investigating. You are invited
                  to ask <em>“why?”</em>, to develop your perception, and to
                  begin to think critically.
                </p>
                <p className="mt-3">
                  This course is meant for you — the thinking student — to
                  invite you to search for the{" "}
                  <em>Pearl of Great Price</em>: that idea that takes you to a
                  new level of thinking.
                </p>
                <p className="mt-3">
                  Look for the topic that you are interested in and that will
                  stimulate you. <em>Trust yourself.</em>
                </p>
                <footer className="mt-4 font-mono text-[10.5px] tracking-[.18em] uppercase text-ink3">
                  — P. B.
                </footer>
              </blockquote>
            </td>
            <td className="w-[320px] border border-rule p-0 align-top last:border-r-0">
              <div className="p-[22px_22px_12px]">
                <Image
                  src="/assets/peebee-portrait.jpg"
                  alt="Pen-and-ink drawing of P. B."
                  width={320}
                  height={390}
                  priority
                  className="book-img block w-full grayscale contrast-[1.05]"
                />
              </div>
              <div className="border-t border-rule p-[10px_22px] font-mono text-[10.5px] tracking-[.12em] uppercase text-ink3">
                P.B. - drawn by Ross Eyre
              </div>
            </td>
          </tr>
          <tr>
            <td
              colSpan={2}
              className="border border-rule p-[26px_28px] align-top first:border-l-0 last:border-r-0"
            >
              <h3 className="mb-[10px] font-mono text-[11px] tracking-[.18em] uppercase">
                Permissions
              </h3>
              <p className="m-0 font-serif text-[16px] leading-[1.6] text-ink2">
                The book <em>“Give Meaning to Maths”</em> (ISBN {BOOK.isbn})
                holds copyright © {BOOK.year} Peter Bishop, with a{" "}
                {BOOK.edition}. Permission is granted that students may receive
                a copy of any topic, but are not to pay for copies handed out
                by a tutor or institute.
              </p>
            </td>
          </tr>
          <tr>
            <td
              colSpan={2}
              className="border border-rule p-[26px_28px] text-center first:border-l-0 last:border-r-0"
            >
              <p className="m-0 font-serif text-[16px] italic leading-[1.5] text-ink2">
                “Success usually comes to those who are too busy to be looking
                for it.”
              </p>
              <p className="mt-2 font-mono text-[10.5px] tracking-[.18em] uppercase text-ink3">
                — Henry David Thoreau
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}
