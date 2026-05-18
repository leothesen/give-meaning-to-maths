import ChapterPage from "./[slug]/page";

export const metadata = { title: "Read — Give Meaning to Maths" };

export default function ReadIndex() {
  return ChapterPage({ params: Promise.resolve({ slug: "preface" }) });
}
