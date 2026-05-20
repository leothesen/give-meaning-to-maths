import Image from "next/image";
import { DocTable, DocRow, DocCell } from "@/components/doc-table";
import { CellLink } from "@/components/cell-link";
import { BOOK } from "@/content/book";

const VOICE_COLS = ["For readers", "For teachers", "For former pupils"] as const;
const VOICE_ROWS: ReadonlyArray<ReadonlyArray<[string, string, string]>> = [
  [
    ["01 · Reader quote", "A short reader endorsement — two or three sentences on what the book did for a general reader.", "— Name, location"],
    ["01 · Teacher quote", "A teacher’s note on how they have used the book in their classroom or staff-room.", "— Name, school / role"],
    ["01 · Former pupil quote", "A memory or reflection from someone PB taught. Specific, short, and signed.", "— Name, years taught"],
  ],
  [
    ["02 · Reader quote", "Second reader quote. Pick voices that differ in age, background, or relationship to maths.", "— Name, location"],
    ["02 · Teacher quote", "Second teacher quote — ideally from a different teaching level.", "— Name, school / role"],
    ["02 · Former pupil quote", "Second former-pupil quote — from a different decade if possible.", "— Name, years taught"],
  ],
  [
    ["03 · Reader quote", "Third reader quote.", "— Name, location"],
    ["03 · Teacher quote", "Third teacher quote.", "— Name, school / role"],
    ["03 · Former pupil quote", "Third former-pupil quote.", "— Name, years taught"],
  ],
];

export default function Home() {
  return (
    <main className="mx-auto max-w-[1080px] border-x border-rule pb-[60px]">
      {/* HERO */}
      <section className="border-b border-rule">
        <DocTable>
          <DocRow>
            <DocCell className="p-[36px_30px] align-middle">
              <span className="mb-[6px] block font-mono text-[10px] font-semibold tracking-[.18em] uppercase">
                An invitation
              </span>
              <h1 className="m-0 font-serif text-[clamp(46px,6.6vw,84px)] font-semibold leading-[.98] tracking-[-.018em]">
                Give Meaning
                <br />
                to <em className="font-medium italic">Maths</em>.
              </h1>
              <p className="mt-[18px] max-w-[32em] font-serif text-[17px] leading-[1.55] text-ink2">
                <em>Give Meaning to Maths</em> invites you to look for the
                meaning behind what you are investigating. You are invited to
                ask <em>“why?”</em>, to develop your perception, and to begin
                to think critically.
              </p>
            </DocCell>
            <DocCell className="w-[360px] border-l border-rule p-0 align-middle">
              <div className="p-[22px_22px_14px]">
                <Image
                  src="/assets/peebee-portrait.jpg"
                  alt="Pen-and-ink drawing of the author"
                  width={360}
                  height={440}
                  className="book-img block w-full grayscale contrast-[1.05]"
                  priority
                />
              </div>
              <div className="border-t border-rule p-[10px_22px] text-center font-mono text-[10.5px] tracking-[.14em] uppercase text-ink3">
                P.B. - drawn by Ross Eyre
              </div>
            </DocCell>
          </DocRow>
          <DocRow>
            <DocCell colSpan={2} className="p-0">
              <CellLink href="/read/preface" invert>
                Begin reading &nbsp;→
              </CellLink>
            </DocCell>
          </DocRow>
        </DocTable>
      </section>

      {/* OVERVIEW */}
      <section>
        <DocTable>
          <DocRow>
            <DocCell variant="header" colSpan={2}>
              An overview
            </DocCell>
          </DocRow>
          <DocRow>
            <DocCell className="w-[60%]">
              <p className="m-0 font-serif text-[18px] leading-[1.6] text-ink2">
                This course is meant for you — the thinking student — to
                invite you to search for the{" "}
                <em>Pearl of Great Price</em>: that idea that takes you to a
                new level of thinking.
              </p>
              <p className="mt-4 font-serif text-[17px] leading-[1.6] text-ink2">
                Look for the topic that you are interested in and that will
                stimulate you. <em>Trust yourself.</em>
              </p>
              <p className="mt-4 font-mono text-[11px] tracking-[.14em] uppercase text-ink3">
                — P. B.
              </p>
            </DocCell>
            <DocCell className="w-[40%] p-0">
              <table className="w-full border-collapse">
                <tbody className="font-mono text-ink3">
                  {(
                    [
                      ["Sections", String(BOOK.sections)],
                      ["Topics", String(BOOK.topics)],
                      ["Pages (print)", String(BOOK.pages)],
                      ["Edition", BOOK.edition],
                      ["ISBN", BOOK.isbn],
                    ] as const
                  ).map(([k, v]) => (
                    <tr key={k}>
                      <td className="border-b border-rule p-[12px_22px]">
                        <span className="font-mono text-[10px] tracking-[.18em] uppercase text-ink">
                          {k}
                        </span>
                      </td>
                      <td className="border-b border-rule p-[12px_22px] text-right text-ink">
                        {v}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DocCell>
          </DocRow>
        </DocTable>
      </section>

      {/* VOICES */}
      <section>
        <table className="w-full border-collapse border-y border-rule">
          <thead>
            <tr>
              {VOICE_COLS.map((c) => (
                <th
                  key={c}
                  className="border border-rule bg-ink p-[12px_22px] text-left font-mono text-[11px] font-semibold tracking-[.18em] uppercase text-paper first:border-l-0 last:border-r-0"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {VOICE_ROWS.map((row, ri) => (
              <tr key={ri}>
                {row.map(([num, body, by], ci) => (
                  <td
                    key={ci}
                    className="w-1/3 border border-rule p-[26px] align-top first:border-l-0 last:border-r-0"
                  >
                    <div className="mb-[10px] font-mono text-[10.5px] tracking-[.18em] uppercase text-ink3">
                      {num}
                    </div>
                    <p className="m-0 text-[17px] italic leading-[1.5] text-ink3">
                      {body}
                    </p>
                    <div className="mt-[14px] font-mono text-[10.5px] tracking-[.18em] uppercase text-ink3">
                      {by}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
