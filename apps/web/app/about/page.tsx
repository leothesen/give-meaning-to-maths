import Image from "next/image";
import { Placeholder } from "@/components/placeholder";

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
            The teacher his pupils called <em className="italic">PeeBee</em>.
          </h1>
        </div>
      </div>

      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <td className="border border-rule p-[26px_28px] align-top first:border-l-0">
              <Placeholder tag="Placeholder · Biography">
                <p>
                  Opening paragraph — one or two sentences placing P. B. (where
                  he taught, for how long).
                </p>
                <p className="mt-3">
                  Second paragraph — the nickname, the kind of teacher he is.
                </p>
                <p className="mt-3">
                  Third paragraph — the range of his teaching, tied back to the
                  book.
                </p>
              </Placeholder>
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
                P. B. — drawn from life
              </div>
            </td>
          </tr>
          <tr>
            <td
              colSpan={2}
              className="border border-rule p-[26px_28px] align-top first:border-l-0 last:border-r-0"
            >
              <h3 className="mb-[10px] font-mono text-[11px] tracking-[.18em] uppercase">
                A note on the teaching
              </h3>
              <Placeholder>
                <p>
                  A short paragraph capturing PB’s philosophy of teaching in his
                  own voice. Concrete details work better than abstractions.
                </p>
              </Placeholder>
            </td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}
