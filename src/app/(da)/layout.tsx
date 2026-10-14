import { Html, metadataFor } from "../shell";

export const metadata = metadataFor("da");
export { viewport } from "../shell";

export default function DanishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <Html locale="da">{children}</Html>;
}
