import { Html, metadataFor } from "../shell";

export const metadata = metadataFor("en");
export { viewport } from "../shell";

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <Html locale="en">{children}</Html>;
}
